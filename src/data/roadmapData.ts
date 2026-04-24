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
  estimatedTime?: string;
  children?: RoadmapNode[];
  problem?: PracticeProblem;
}

export const ROADMAP_DATA: Record<string, RoadmapNode[]> = {
  Beginner: [
    {
      id: 'b-basics',
      title: 'Programming Fundamentals',
      description: 'Start with the building blocks: variables, data types, and console I/O.',
      topics: ['Variables', 'Data Types', 'Input / Output', 'Comments'],
      estimatedTime: '2-3 hrs',
      problem: {
        title: 'Hello World Function',
        description: "Write a function that returns the string 'Hello World'.",
        difficulty: 'Easy',
        starterCode: "def solution(n):\n    return 'Hello World'",
        testCases: [{ input: '0', expected: '"Hello World"' }],
      },
      children: [
        {
          id: 'b-operators',
          title: 'Operators & Expressions',
          description: 'Arithmetic, comparison, and logical operators with precedence rules.',
          topics: ['Arithmetic', 'Comparison', 'Logical', 'Precedence'],
          estimatedTime: '1-2 hrs',
          problem: {
            title: 'Area of Rectangle',
            description: 'Given [length, breadth], return the area.',
            difficulty: 'Easy',
            starterCode: 'def solution(arr):\n    # arr = [length, breadth]\n    pass',
            testCases: [
              { input: '[5, 4]', expected: '20' },
              { input: '[10, 3]', expected: '30' },
            ],
          },
          children: [
            {
              id: 'b-control',
              title: 'Control Flow',
              description: 'Branch your logic with if / else / elif.',
              topics: ['if / else', 'elif', 'Ternary', 'Nested conditions'],
              estimatedTime: '2 hrs',
              problem: {
                title: 'Check Even or Odd',
                description: "Return 'Even' if the number is even, otherwise 'Odd'.",
                difficulty: 'Easy',
                starterCode: 'def solution(n):\n    pass',
                testCases: [
                  { input: '2', expected: '"Even"' },
                  { input: '7', expected: '"Odd"' },
                ],
              },
              children: [
                {
                  id: 'b-loops',
                  title: 'Loops & Iteration',
                  description: 'Repeat actions with for and while loops.',
                  topics: ['for', 'while', 'break', 'continue'],
                  estimatedTime: '3 hrs',
                  problem: {
                    title: 'Sum of N Numbers',
                    description: 'Return the sum of all numbers from 1 to n.',
                    difficulty: 'Easy',
                    starterCode: 'def solution(n):\n    pass',
                    testCases: [
                      { input: '5', expected: '15' },
                      { input: '10', expected: '55' },
                    ],
                  },
                  children: [
                    {
                      id: 'b-functions',
                      title: 'Functions',
                      description: 'Wrap reusable logic with parameters and return values.',
                      topics: ['Parameters', 'Return', 'Scope', 'Default args'],
                      estimatedTime: '3 hrs',
                      problem: {
                        title: 'Factorial',
                        description: 'Return the factorial of n.',
                        difficulty: 'Easy',
                        starterCode: 'def solution(n):\n    pass',
                        testCases: [
                          { input: '5', expected: '120' },
                          { input: '0', expected: '1' },
                        ],
                      },
                      children: [
                        {
                          id: 'b-arrays',
                          title: 'Arrays & Lists',
                          description: 'Store, access, and iterate collections of data.',
                          topics: ['Indexing', 'Slicing', 'Traversal', 'Mutation'],
                          estimatedTime: '3 hrs',
                          problem: {
                            title: 'Find Maximum',
                            description: 'Return the largest number in the array.',
                            difficulty: 'Easy',
                            starterCode: 'def solution(arr):\n    pass',
                            testCases: [
                              { input: '[1, 5, 3, 9, 2]', expected: '9' },
                              { input: '[-5, -1, -10]', expected: '-1' },
                            ],
                          },
                          children: [
                            {
                              id: 'b-strings',
                              title: 'Strings',
                              description: 'Manipulate text with indexing, slicing, and built-in methods.',
                              topics: ['Indexing', 'Concatenation', 'split / join', 'Case'],
                              estimatedTime: '2 hrs',
                              problem: {
                                title: 'Count Vowels',
                                description: 'Count the number of vowels in a string.',
                                difficulty: 'Easy',
                                starterCode: 'def solution(s):\n    pass',
                                testCases: [
                                  { input: '"hello"', expected: '2' },
                                  { input: '"sky"', expected: '0' },
                                ],
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  Medium: [
    {
      id: 'm-strings',
      title: 'String Manipulation',
      description: 'Palindromes, anagrams, and common pattern-matching techniques.',
      topics: ['Palindromes', 'Anagrams', 'Substrings', 'Pattern matching'],
      estimatedTime: '3-4 hrs',
      problem: {
        title: 'Reverse String',
        description: 'Reverse a given string.',
        difficulty: 'Medium',
        starterCode: 'def solution(s):\n    return s[::-1]',
        testCases: [
          { input: '"hello"', expected: '"olleh"' },
          { input: '"CodeCoach"', expected: '"hcaoCedoC"' },
        ],
      },
      children: [
        {
          id: 'm-arrays-adv',
          title: 'Advanced Arrays',
          description: 'Two pointers, sliding window, and prefix sums.',
          topics: ['Two Pointers', 'Sliding Window', 'Prefix Sum', 'Kadane'],
          estimatedTime: '4-5 hrs',
          problem: {
            title: 'Two Sum',
            description: 'Find the indices of two numbers that add up to target.',
            difficulty: 'Medium',
            starterCode: "def solution(data):\n    nums = data['nums']\n    target = data['target']\n    pass",
            testCases: [{ input: 'nums=[2,7,11,15], target=9', expected: '[0, 1]' }],
          },
          children: [
            {
              id: 'm-hashmap',
              title: 'Hash Maps & Sets',
              description: 'O(1) lookups, frequency counts, and grouping.',
              topics: ['Hash Map', 'Hash Set', 'Frequency Count', 'Grouping'],
              estimatedTime: '3 hrs',
              problem: {
                title: 'First Unique Character',
                description: 'Return the index of the first non-repeating character (-1 if none).',
                difficulty: 'Medium',
                starterCode: 'def solution(s):\n    pass',
                testCases: [
                  { input: '"leetcode"', expected: '0' },
                  { input: '"aabb"', expected: '-1' },
                ],
              },
              children: [
                {
                  id: 'm-recursion',
                  title: 'Recursion',
                  description: 'Solve problems by reducing them to smaller sub-problems.',
                  topics: ['Base case', 'Recurrence', 'Divide & Conquer'],
                  estimatedTime: '4 hrs',
                  problem: {
                    title: 'Fibonacci',
                    description: 'Return the nth Fibonacci number.',
                    difficulty: 'Medium',
                    starterCode: 'def solution(n):\n    pass',
                    testCases: [
                      { input: '5', expected: '5' },
                      { input: '10', expected: '55' },
                    ],
                  },
                  children: [
                    {
                      id: 'm-sorting',
                      title: 'Searching & Sorting',
                      description: 'Binary search, merge sort, and quicksort patterns.',
                      topics: ['Binary Search', 'Merge Sort', 'Quick Sort', 'Complexity'],
                      estimatedTime: '5 hrs',
                      problem: {
                        title: 'Binary Search',
                        description: 'Return the index of target in a sorted array, or -1.',
                        difficulty: 'Medium',
                        starterCode: "def solution(data):\n    arr = data['arr']\n    target = data['target']\n    pass",
                        testCases: [{ input: 'arr=[1,3,5,7,9], target=5', expected: '2' }],
                      },
                      children: [
                        {
                          id: 'm-stacks',
                          title: 'Stacks & Queues',
                          description: 'LIFO and FIFO structures for order-dependent problems.',
                          topics: ['Stack', 'Queue', 'Deque', 'Monotonic Stack'],
                          estimatedTime: '3 hrs',
                          problem: {
                            title: 'Valid Parentheses',
                            description: 'Determine if the input string of brackets is balanced.',
                            difficulty: 'Medium',
                            starterCode: 'def solution(s):\n    pass',
                            testCases: [
                              { input: '"()[]{}"', expected: 'true' },
                              { input: '"([)]"', expected: 'false' },
                            ],
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  Expert: [
    {
      id: 'e-trees',
      title: 'Trees & Binary Search Trees',
      description: 'Hierarchical data structures with tree traversals.',
      topics: ['DFS', 'BFS', 'BST', 'Traversals'],
      estimatedTime: '5-6 hrs',
      problem: {
        title: 'Maximum Depth of Binary Tree',
        description: 'Given the root of a binary tree, return its maximum depth.',
        difficulty: 'Hard',
        starterCode: 'def solution(root):\n    pass',
        testCases: [{ input: '[3,9,20,null,null,15,7]', expected: '3' }],
      },
      children: [
        {
          id: 'e-graphs',
          title: 'Graphs',
          description: 'BFS, DFS, shortest paths, and connected components.',
          topics: ['Adjacency List', 'BFS', 'DFS', 'Topological Sort'],
          estimatedTime: '6-7 hrs',
          problem: {
            title: 'Number of Islands',
            description: "Count the number of islands in a 2D grid of '1's and '0's.",
            difficulty: 'Hard',
            starterCode: 'def solution(grid):\n    pass',
            testCases: [{ input: '[["1","1","0"],["0","1","0"],["0","0","1"]]', expected: '2' }],
          },
          children: [
            {
              id: 'e-dp',
              title: 'Dynamic Programming',
              description: 'Optimize recursive problems with memoization and tabulation.',
              topics: ['Memoization', 'Tabulation', 'Knapsack', 'LIS'],
              estimatedTime: '8-10 hrs',
              problem: {
                title: 'Climbing Stairs',
                description: 'Count distinct ways to climb n stairs taking 1 or 2 steps at a time.',
                difficulty: 'Hard',
                starterCode: 'def solution(n):\n    pass',
                testCases: [
                  { input: '2', expected: '2' },
                  { input: '3', expected: '3' },
                ],
              },
              children: [
                {
                  id: 'e-greedy',
                  title: 'Greedy Algorithms',
                  description: 'Make locally optimal choices that lead to a global optimum.',
                  topics: ['Interval Scheduling', 'Huffman', 'Activity Selection'],
                  estimatedTime: '4 hrs',
                  problem: {
                    title: 'Jump Game',
                    description: 'Can you reach the last index of the array?',
                    difficulty: 'Hard',
                    starterCode: 'def solution(nums):\n    pass',
                    testCases: [
                      { input: '[2,3,1,1,4]', expected: 'true' },
                      { input: '[3,2,1,0,4]', expected: 'false' },
                    ],
                  },
                  children: [
                    {
                      id: 'e-backtracking',
                      title: 'Backtracking',
                      description: 'Explore all possibilities and prune invalid branches.',
                      topics: ['Subsets', 'Permutations', 'N-Queens', 'Sudoku'],
                      estimatedTime: '5 hrs',
                      problem: {
                        title: 'Generate Permutations',
                        description: 'Return all unique permutations of the input array.',
                        difficulty: 'Hard',
                        starterCode: 'def solution(nums):\n    pass',
                        testCases: [
                          {
                            input: '[1,2,3]',
                            expected: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]',
                          },
                        ],
                      },
                      children: [
                        {
                          id: 'e-advanced',
                          title: 'Advanced Algorithms',
                          description: 'Union-Find, Tries, Segment Trees, and Dijkstra.',
                          topics: ['Union-Find', 'Trie', 'Segment Tree', 'Dijkstra'],
                          estimatedTime: '10+ hrs',
                          problem: {
                            title: 'Word Search',
                            description:
                              'Given a grid of characters and a target word, return true if the word exists in the grid.',
                            difficulty: 'Hard',
                            starterCode:
                              "def solution(data):\n    board = data['board']\n    word = data['word']\n    pass",
                            testCases: [
                              { input: 'board=[["A","B","C"],["D","E","F"]], word="ABE"', expected: 'true' },
                            ],
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
