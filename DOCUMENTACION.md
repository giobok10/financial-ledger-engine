# Documentación Técnica

## Proyecto: Financial Transaction Ledger & Audit Reversal Engine

---

## 1. Descripción del Dominio y Diagnóstico de Ingeniería

### 1.1 El Dominio Financiero

Un _Financial Ledger_ (Libro Diario Contable) registra eventos monetarios de forma cronológica e inmutable. Para llevar a cabo procesos de auditoría, conciliación bancaria o reversión de transacciones en orden inverso (LIFO - _Last In, First Out_), el sistema debe ser capaz de reorientar el flujo de procesamiento transaccional sin incurrir en latencias de almacenamiento secundario.

### 1.2 El Problema Legacy (Análisis del Call Stack)

El motor de reversión legacy utilizaba un enfoque **recursivo** para invertir la estructura del libro contable.

Cuando una función se ejecuta recursivamente, cada llamada genera un **Marco de Pila (Stack Frame)** en la memoria asignada al hilo (_Call Stack_). El tamaño del Call Stack en sistemas operativos modernos para hilos de .NET oscila entre **1 MB y 4 MB**.

$$\text{Stack Frame Size} \times N \text{ llamadas} > \text{Límite Físico del Call Stack}$$

Al procesar lotes de **100,000 transacciones**:

1. Se acumulan 100,000 marcos de llamada simultáneos antes de alcanzar el caso base (`node == null`).
2. La pila agota la memoria física reservada para el hilo.
3. El Common Language Runtime (CLR) de .NET interrumpe el proceso emitiendo un `System.StackOverflowException`.
4. **Consecuencia en producción**: A diferencia de excepciones estándar, `StackOverflowException` es una falla irrecuperable que aborta inmediatamente el proceso de la aplicación en el sistema operativo.

---

## 2. Solución Algorítmica Implementada

Para resolver el colapso sin comprometer el rendimiento, se refactorizó la estructura a una **Lista Enlazada Simple propia (sin colecciones nativas de .NET)** y un algoritmo de reversión in-place basado en **3 punteros**.

### 2.1 Estructuras de Datos Primarias

#### `TransactionNode`

Representa un registro individual inmutable en la memoria Heap.

- `Val` (int): Identificador/monto de la transacción.
- `Next` (TransactionNode?): Referencia en memoria al siguiente nodo cronológico.

#### `SinglyLinkedListLedger`

Estructura customizada que mantiene el control de la cabeza (`Head`) y ofrece operaciones en tiempo constante $\mathcal{O}(1)$:

- **Push(val)**: Inserta un nodo al inicio ($\mathcal{O}(1)$).
- **Pop()**: Remueve y retorna el nodo superior validando el estado de la lista vacía (_Underflow_) ($\mathcal{O}(1)$).

---

### 2.2 Algoritmo Iterativo de 3 Punteros ($\mathcal{O}(1)$ Espacio Auxiliar)

El algoritmo recorre la lista una sola vez reorientando los punteros `Next` en tiempo real sin acumular contexto de llamadas.

#### Referencias Auxiliares:

1. `prev`: Apunta al nodo previamente procesado (inicialmente `null`).
2. `current`: Apunta al nodo en evaluación (inicialmente `Head`).
3. `nextTemp`: Almacena temporalmente el enlace hacia adelante antes de desconectarlo.

#### Bucle de Reorientación:

```csharp
public void ReverseIterative()
{
    TransactionNode? prev = null;
    TransactionNode? current = Head;
    TransactionNode? nextTemp = null;

    while (current != null)
    {
        nextTemp = current.Next; // 1. Guardar dirección del siguiente nodo
        current.Next = prev;     // 2. Invertir el puntero hacia atrás
        prev = current;          // 3. Avanzar 'prev' un paso
        current = nextTemp;      // 4. Avanzar 'current' un paso
    }

    Head = prev; // La nueva cabeza es el último nodo procesado
}
```

#### Análisis de Complejidad:

- **Temporal**: $\mathcal{O}(N)$ — Visita exactamente una vez cada uno de los $N$ nodos.
- **Espacial Auxiliar**: $\mathcal{O}(1)$ — Reutiliza únicamente 3 variables de referencia independientemente de si $N = 10$ o $N = 1,000,000$.

---

## 3. Arquitectura del Sistema y Patrones de Diseño

El sistema está diseñado bajo principios de **Clean Architecture** estructurado en las siguientes capas:

```
backend/
├── FinancialLedgerEngine.Domain/       <-- Lógica pura de estructuras de datos (0 dependencias)
├── FinancialLedgerEngine.Services/     <-- Orquestación, DTOs y Medición de Telemetría
└── FinancialLedgerEngine.Api/          <-- Controllers, Middleware CORS e Inyección de Dependencias
```

### 3.1 Ciclo de Vida del Servicio (Singleton)

Dado que el ledger contable opera enteramente en memoria RAM sin base de datos relacional externa, el servicio `TransactionLedgerService` se registra en la API REST con un ciclo de vida **Singleton**:

```csharp
builder.Services.AddSingleton<ITransactionLedgerService, TransactionLedgerService>();
```

Esto garantiza que el estado de los $100,000$ nodos persista inmutable a lo largo de múltiples peticiones HTTP independientes (`POST /populate`, `GET /state`, `POST /reverse`).

### 3.2 Auditoría de Telemetría de Alta Precisión

Para evitar lecturas inexactas provocadas por la baja resolución de clases como `DateTime.Now`, el motor de telemetría utiliza:

- **`System.Diagnostics.Stopwatch`**: Mide directamente los ticks del contador del procesador (`ElapsedTicks`).
- **`GC.GetAllocatedBytesForCurrentThread()`**: Mide exclusivamente los bytes solicitados a la memoria RAM por el hilo execution en evaluación, aislando el ruido de otros procesos del sistema operativo.

---

## 4. Orquestación e Infraestructura

La contenerización se implementó mediante un esquema **Multi-Stage Build** para minimizar el tamaño de las imágenes finales de producción.

### 4.1 Backend Dockerfile

- **Build Stage**: Utiliza el SDK completo `mcr.microsoft.com/dotnet/sdk:8.0` para restaurar y publicar los binarios en modo `Release`.
- **Runtime Stage**: Copia únicamente los artefactos publicados hacia la imagen liviana `mcr.microsoft.com/dotnet/aspnet:8.0`.

### 4.2 Frontend Dockerfile

- **Build Stage**: Compila la aplicación React / TypeScript mediante `node:20-alpine` y `pnpm`.
- **Production Stage**: Transfiere los estáticos HTML/JS empaquetados hacia un servidor web ligero **Nginx Alpine**, sirviendo los archivos en el puerto `80`.

---

## 5. Estrategia de Pruebas Unitarias (xUnit)

La suite de pruebas automatizadas en `FinancialLedgerEngine.Domain.Tests` valida los invariantes del sistema utilizando el patrón **AAA (Arrange, Act, Assert)**:

1. **`PushAndPop_ShouldMaintainLIFOOrder`**: Valida que la estructura respete el orden estricto de Pila (Last-In, First-Out).
2. **`ReverseIterative_With100KNodes_ShouldExecuteSuccessfullyInConstantMemory`**: Garantiza que la reversión de $100,000$ elementos reposicione correctamente el primer nodo como `Head` y se complete en pocos milisegundos.
3. **`ReverseRecursive_With100KNodes_WillOverflowCallStack`**: Marcada con `[Fact(Skip = "...")]` para evitar interrumpir los pipelines de Integración Continua (CI/CD) debido al colapso deliberado del proceso por Stack Overflow.
