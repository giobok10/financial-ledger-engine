# Etapa 1: Build y compilación con el SDK de .NET 8
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar archivos .csproj e instalar dependencias
COPY ["FinancialLedgerEngine.Domain/FinancialLedgerEngine.Domain.csproj", "FinancialLedgerEngine.Domain/"]
COPY ["FinancialLedgerEngine.Services/FinancialLedgerEngine.Services.csproj", "FinancialLedgerEngine.Services/"]
COPY ["FinancialLedgerEngine.Api/FinancialLedgerEngine.Api.csproj", "FinancialLedgerEngine.Api/"]

RUN dotnet restore "FinancialLedgerEngine.Api/FinancialLedgerEngine.Api.csproj"

# Copiar el resto del código y compilar en modo Release
COPY . .
WORKDIR "/src/FinancialLedgerEngine.Api"
RUN dotnet publish "FinancialLedgerEngine.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Etapa 2: Runtime ligero de .NET 8 (Imagen final pequeña)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "FinancialLedgerEngine.Api.dll"]
