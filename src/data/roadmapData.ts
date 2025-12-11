export interface PracticeProblem {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  starterCode: string;
  testCases: { input: string; expected: string }[];
}

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  topics?: string[];
  children?: RoadmapNode[];
  problem?: PracticeProblem;
}

export const ROADMAP_DATA: Record<string, RoadmapNode[]> = {
  Beginner: [
    {
      id: 'b-basics',
      title: 'Programming Fundamentals',
      description: 'The building blocks of code.',
      topics: ['Variables', 'Data Types', 'Input/Output'],
      problem: {
        title: "Hello World Function",
        description: "Write a function that returns the string 'Hello World'.",
        difficulty: 'Easy',
        starterCode: "def solution(n):\n    return 'Hello World'",
        testCases: [
          { input: '0', expected: '"Hello World"' }
        ]
      },
      children: [
        {
          id: 'b-control',
          title: 'Control Flow',
          description: 'Making decisions in code.',
          problem: {
            title: "Check Even or Odd",
            description: "Write a function that returns 'Even' if the number is even, and 'Odd' if it is odd.",
            difficulty: 'Easy',
            starterCode: "def solution(n):\n    # Write your logic here\n    pass",
            testCases: [
              { input: '2', expected: '"Even"' },
              { input: '7', expected: '"Odd"' }
            ]
          },
          children: [
            {
              id: 'b-loops',
              title: 'Loops',
              description: 'Repeating actions.',
              problem: {
                title: "Sum of N Numbers",
                description: "Calculate the sum of all numbers from 1 to n.",
                difficulty: 'Easy',
                starterCode: "def solution(n):\n    # Use a loop or formula\n    pass",
                testCases: [
                  { input: '5', expected: '15' },
                  { input: '10', expected: '55' }
                ]
              },
              children: [
                {
                  id: 'b-arrays',
                  title: 'Introduction to Arrays',
                  description: 'Storing collections of data.',
                  problem: {
                    title: "Find Maximum",
                    description: "Find the largest number in an array.",
                    difficulty: 'Easy',
                    starterCode: "def solution(arr):\n    # Find the max value\n    pass",
                    testCases: [
                      { input: '[1, 5, 3, 9, 2]', expected: '9' },
                      { input: '[-5, -1, -10]', expected: '-1' }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  Medium: [
    {
      id: 'm-strings',
      title: 'String Manipulation',
      description: 'Working with text data.',
      problem: {
        title: "Reverse String",
        description: "Write a function that reverses a string.",
        difficulty: 'Medium',
        starterCode: "def solution(s):\n    return s[::-1]",
        testCases: [
          { input: '"hello"', expected: '"olleh"' },
          { input: '"CodeCoach"', expected: '"hcaoCedoC"' }
        ]
      },
      children: [
        {
          id: 'm-arrays-adv',
          title: 'Advanced Arrays',
          description: 'Two pointers and sliding windows.',
          problem: {
            title: "Two Sum",
            description: "Find indices of two numbers that add up to target.",
            difficulty: 'Medium',
            starterCode: "def solution(data):\n    nums = data['nums']\n    target = data['target']\n    pass",
            testCases: [
              { input: "nums=[2,7,11,15], target=9", expected: "[0, 1]" }
            ]
          }
        }
      ]
    }
  ],
  Expert: [
    {
      id: 'e-dp',
      title: 'Dynamic Programming',
      description: 'Optimization problems.',
      problem: {
        title: "Climbing Stairs",
        description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        difficulty: 'Hard',
        starterCode: "def solution(n):\n    pass",
        testCases: [
          { input: '2', expected: '2' },
          { input: '3', expected: '3' }
        ]
      }
    }
  ]
};