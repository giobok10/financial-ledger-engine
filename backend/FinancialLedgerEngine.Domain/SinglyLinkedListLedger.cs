namespace FinancialLedgerEngine.Domain;

public class SinglyLinkedListLedger
{
    public TransactionNode? Head { get; private set; }
    public int Count { get; private set; }

    public void Push(int val)
    {
        var newNode = new TransactionNode(val)
        {
            Next = Head
        };
        Head = newNode;
        Count++;
    }

    public int Pop()
    {
        if (Head == null)
        {
            throw new InvalidOperationException("Underflow: El ledger contable está vacío.");
        }

        int val = Head.Val;
        Head = Head.Next;
        Count--;
        return val;
    }

    public void ReverseRecursive()
    {
        Head = ReverseRecursiveHelper(Head);
    }

    private TransactionNode? ReverseRecursiveHelper(TransactionNode? node)
    {
        if (node == null || node.Next == null)
        {
            return node;
        }

        TransactionNode? newHead = ReverseRecursiveHelper(node.Next);
        node.Next.Next = node;
        node.Next = null;
        return newHead;
    }

    public void ReverseIterative()
    {
        TransactionNode? prev = null;
        TransactionNode? current = Head;
        TransactionNode? nextTemp = null;

        while (current != null)
        {
            nextTemp = current.Next;
            current.Next = prev;
            prev = current;
            current = nextTemp;
        }

        Head = prev;
    }
}
