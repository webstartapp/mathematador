export const operations = [
    {
        "operationId": "addition",
        "symbol": "+",
        description: "Addition is the process of adding two or more numbers together to get a sum.",
        getResult: (numbers: number[]) => numbers.reduce((acc, curr) => acc + curr, 0),
        timeCoeficient: 1,
        xpCoeficient: 1,
        resultIsFirst: false,
    },
    {
        operationId: "subtraction",
        symbol: "-",
        description: "Subtraction is the process of removing one number from another.",
        getResult: (numbers: number[]) => numbers.reduce((acc, curr) => acc - curr),
        timeCoeficient: 1.5,
        xpCoeficient: 1.5,
        resultIsFirst: true,
    },
    {
        operationId: "multiplication",
        symbol: "x",
        description: "Multiplication is the process of adding a number to itself a certain number of times.",
        getResult: (numbers: number[]) => numbers.reduce((acc, curr) => acc * curr, 1),
        timeCoeficient: 2,
        xpCoeficient: 2,
        resultIsFirst: false,
    },
    {
        operationId: "division",
        symbol: "/",
        description: "Division is the process of splitting a number into equal parts.",
        getResult: (numbers: number[]) => numbers.reduce((acc, curr) => acc / curr),
        timeCoeficient: 2.5,
        xpCoeficient: 2.5,
        resultIsFirst: true,
    }
]