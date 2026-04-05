export interface PracticeProblem {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  starterCode: string;
  executionMode?: 'function' | 'stdin';
  functionName?: string;
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
      description: 'The building blocks of code including variables, data types, and basic operations.',
      topics: ['Variables', 'Data Types', 'Input/Output', 'Operators'],
      problem: {
        title: "Hello World Function",
        description: "Write a function that returns the string 'Hello World'. This is your first step in programming!",
        difficulty: 'Easy',
        starterCode: "def solution(n):\n    pass",
        testCases: [
          { input: '0', expected: '"Hello World"' },
          { input: '1', expected: '"Hello World"' }
        ]
      },
      children: [
        {
          id: 'b-control',
          title: 'Control Flow',
          description: 'Making decisions in code using conditional statements.',
          topics: ['if-else', 'comparison operators', 'logical operators'],
          problem: {
            title: "Check Even or Odd",
            description: "Write a function that returns 'Even' if the number is even, and 'Odd' if it is odd.",
            difficulty: 'Easy',
            starterCode: "def solution(n):\n    pass",
            testCases: [
              { input: '2', expected: '"Even"' },
              { input: '7', expected: '"Odd"' },
              { input: '0', expected: '"Even"' }
            ]
          },
          children: [
            {
              id: 'b-positive-negative',
              title: 'Positive or Negative',
              description: 'Determine if a number is positive, negative, or zero.',
              problem: {
                title: "Positive Negative or Zero",
                description: "Write a function that returns 'Positive', 'Negative', or 'Zero' based on the input number.",
                difficulty: 'Easy',
                starterCode: "def solution(n):\n    pass",
                testCases: [
                  { input: '5', expected: '"Positive"' },
                  { input: '-3', expected: '"Negative"' },
                  { input: '0', expected: '"Zero"' }
                ]
              }
            },
            {
              id: 'b-leap-year',
              title: 'Leap Year Check',
              description: 'Determine if a given year is a leap year.',
              problem: {
                title: "Leap Year Checker",
                description: "Write a function that returns True if the given year is a leap year, False otherwise.",
                difficulty: 'Easy',
                starterCode: "def solution(year):\n    pass",
                testCases: [
                  { input: '2020', expected: 'True' },
                  { input: '2023', expected: 'False' },
                  { input: '2000', expected: 'True' }
                ]
              }
            }
          ]
        },
        {
          id: 'b-loops',
          title: 'Loops',
          description: 'Repeating actions using for and while loops.',
          topics: ['for loops', 'while loops', 'range', 'loop control'],
          problem: {
            title: "Sum of N Numbers",
            description: "Calculate the sum of all numbers from 1 to n using a loop.",
            difficulty: 'Easy',
            starterCode: "def solution(n):\n    pass",
            testCases: [
              { input: '5', expected: '15' },
              { input: '10', expected: '55' },
              { input: '1', expected: '1' }
            ]
          },
          children: [
            {
              id: 'b-factorial',
              title: 'Factorial',
              description: 'Calculate the factorial of a number.',
              problem: {
                title: "Factorial of N",
                description: "Write a function that returns the factorial of n (n!). Factorial of 0 is 1.",
                difficulty: 'Easy',
                starterCode: "def solution(n):\n    pass",
                testCases: [
                  { input: '5', expected: '120' },
                  { input: '0', expected: '1' },
                  { input: '3', expected: '6' }
                ]
              }
            },
            {
              id: 'b-multiplication',
              title: 'Multiplication Table',
              description: 'Generate multiplication table for a number.',
              problem: {
                title: "Multiplication Table",
                description: "Write a function that returns a list containing the multiplication table of n from 1 to 10.",
                difficulty: 'Easy',
                starterCode: "def solution(n):\n    pass",
                testCases: [
                  { input: '5', expected: '[5, 10, 15, 20, 25, 30, 35, 40, 45, 50]' },
                  { input: '3', expected: '[3, 6, 9, 12, 15, 18, 21, 24, 27, 30]' }
                ]
              }
            },
            {
              id: 'b-prime-check',
              title: 'Prime Number',
              description: 'Check if a number is prime.',
              problem: {
                title: "Prime Number Check",
                description: "Write a function that returns True if n is a prime number, False otherwise.",
                difficulty: 'Easy',
                starterCode: "def solution(n):\n    pass",
                testCases: [
                  { input: '7', expected: 'True' },
                  { input: '4', expected: 'False' },
                  { input: '1', expected: 'False' }
                ]
              }
            }
          ]
        },
        {
          id: 'b-arrays',
          title: 'Arrays Basics',
          description: 'Storing and manipulating collections of data.',
          topics: ['arrays', 'lists', 'indexing', 'iteration'],
          problem: {
            title: "Find Maximum",
            description: "Find the largest number in an array.",
            difficulty: 'Easy',
            starterCode: "def solution(arr):\n    pass",
            testCases: [
              { input: '[1, 5, 3, 9, 2]', expected: '9' },
              { input: '[-5, -1, -10]', expected: '-1' },
              { input: '[42]', expected: '42' }
            ]
          },
          children: [
            {
              id: 'b-array-min',
              title: 'Find Minimum',
              description: 'Find the smallest number in an array.',
              problem: {
                title: "Find Minimum",
                description: "Find the smallest number in an array.",
                difficulty: 'Easy',
                starterCode: "def solution(arr):\n    pass",
                testCases: [
                  { input: '[1, 5, 3, 9, 2]', expected: '1' },
                  { input: '[-5, -1, -10]', expected: '-10' }
                ]
              }
            },
            {
              id: 'b-array-sum',
              title: 'Array Sum',
              description: 'Calculate the sum of all elements in an array.',
              problem: {
                title: "Sum of Array",
                description: "Write a function that returns the sum of all elements in the array.",
                difficulty: 'Easy',
                starterCode: "def solution(arr):\n    pass",
                testCases: [
                  { input: '[1, 2, 3, 4, 5]', expected: '15' },
                  { input: '[10, 20, 30]', expected: '60' }
                ]
              }
            },
            {
              id: 'b-array-reverse',
              title: 'Reverse Array',
              description: 'Reverse the elements of an array.',
              problem: {
                title: "Reverse Array",
                description: "Write a function that returns the array reversed.",
                difficulty: 'Easy',
                starterCode: "def solution(arr):\n    pass",
                testCases: [
                  { input: '[1, 2, 3, 4, 5]', expected: '[5, 4, 3, 2, 1]' },
                  { input: '[1]', expected: '[1]' }
                ]
              }
            },
            {
              id: 'b-array-find',
              title: 'Find Element',
              description: 'Find the index of a specific element.',
              problem: {
                title: "Find Index of Element",
                description: "Write a index of the first function that returns the occurrence of target in the array. Return -1 if not found.",
                difficulty: 'Easy',
                starterCode: "def solution(arr, target):\n    pass",
                testCases: [
                  { input: '[1,2,3,4,5], 3', expected: '2' },
                  { input: '[1,2,3,4,5], 6', expected: '-1' }
                ]
              }
            }
          ]
        },
        {
          id: 'b-searching',
          title: 'Searching Basics',
          description: 'Basic searching algorithms.',
          topics: ['linear search', 'binary search basics'],
          problem: {
            title: "Linear Search",
            description: "Implement linear search to find if a target exists in the array.",
            difficulty: 'Easy',
            starterCode: "def solution(arr, target):\n    pass",
            testCases: [
              { input: '[1,2,3,4,5], 4', expected: 'True' },
              { input: '[1,2,3,4,5], 6', expected: 'False' }
            ]
          }
        }
      ]
    }
  ],
  Medium: [
    {
      id: 'm-strings',
      title: 'String Manipulation',
      description: 'Working with text data and string algorithms.',
      topics: ['string methods', 'string indexing', 'string slicing'],
      problem: {
        title: "Reverse String",
        description: "Write a function that reverses a string.",
        difficulty: 'Medium',
        starterCode: "def solution(s):\n    pass",
        testCases: [
          { input: '"hello"', expected: '"olleh"' },
          { input: '"CodeCoach"', expected: '"hcaoCedoC"' },
          { input: '"a"', expected: '"a"' }
        ]
      },
      children: [
        {
          id: 'm-palindrome',
          title: 'Palindrome Check',
          description: 'Check if a string is a palindrome.',
          problem: {
            title: "Valid Palindrome",
            description: "Write a function that returns True if the string is a palindrome (reads the same forwards and backwards), False otherwise. Ignore case and non-alphanumeric characters.",
            difficulty: 'Medium',
            starterCode: "def solution(s):\n    pass",
            testCases: [
              { input: '"A man, a plan, a canal: Panama"', expected: 'True' },
              { input: '"race a car"', expected: 'False' },
              { input: '" "', expected: 'True' }
            ]
          }
        },
        {
          id: 'm-anagram',
          title: 'Anagram Detection',
          description: 'Check if two strings are anagrams.',
          problem: {
            title: "Valid Anagram",
            description: "Write a function that returns True if t is an anagram of s, False otherwise.",
            difficulty: 'Medium',
            starterCode: "def solution(s, t):\n    pass",
            testCases: [
              { input: '"anagram", "nagaram"', expected: 'True' },
              { input: '"rat", "car"', expected: 'False' }
            ]
          }
        },
        {
          id: 'm-string-compress',
          title: 'String Compression',
          description: 'Compress consecutive duplicate characters.',
          problem: {
            title: "String Compression",
            description: "Given an array of characters, compress them in place. Return the length of the array after compression.",
            difficulty: 'Medium',
            starterCode: "def solution(chars):\n    pass",
            testCases: [
              { input: '["a","a","b","b","c","c","c"]', expected: '6' },
              { input: '["a"]', expected: '1' }
            ]
          }
        },
        {
          id: 'm-longest-common-prefix',
          title: 'Longest Common Prefix',
          description: 'Find the longest common prefix among an array of strings.',
          problem: {
            title: "Longest Common Prefix",
            description: "Write a function that returns the longest common prefix string amongst an array of strings. If there is no common prefix, return ''.",
            difficulty: 'Medium',
            starterCode: "def solution(strs):\n    pass",
            testCases: [
              { input: '["flower","flow","flight"]', expected: '"fl"' },
              { input: '["dog","racecar","car"]', expected: '""' }
            ]
          }
        }
      ]
    },
    {
      id: 'm-two-pointers',
      title: 'Two Pointers',
      description: 'Efficient array manipulation using two pointers.',
      topics: ['two pointers', 'sorted arrays', 'duplicates'],
      problem: {
        title: "Valid Palindrome II",
        description: "Write a function that returns True if the string can be a palindrome after removing at most one character.",
        difficulty: 'Medium',
        starterCode: "def solution(s):\n    pass",
        testCases: [
          { input: '"aba"', expected: 'True' },
          { input: '"abca"', expected: 'True' },
          { input: '"abc"', expected: 'False' }
        ]
      },
      children: [
        {
          id: 'm-remove-duplicates',
          title: 'Remove Duplicates',
          description: 'Remove duplicates from a sorted array.',
          problem: {
            title: "Remove Duplicates from Sorted Array",
            description: "Write a function that removes duplicates from a sorted array in place. Return the length of the array after removing duplicates.",
            difficulty: 'Medium',
            starterCode: "def solution(nums):\n    pass",
            testCases: [
              { input: '[1,1,2]', expected: '2' },
              { input: '[0,0,1,1,1,2,2,3,3,4]', expected: '5' }
            ]
          }
        },
        {
          id: 'm-squares-sorted',
          title: 'Squares of Sorted Array',
          description: 'Square elements and sort them.',
          problem: {
            title: "Squares of a Sorted Array",
            description: "Given an integer array sorted in non-decreasing order, return an array of the squares of each number sorted in non-decreasing order.",
            difficulty: 'Medium',
            starterCode: "def solution(nums):\n    pass",
            testCases: [
              { input: '[-4,-1,0,3,10]', expected: '[0,1,9,16,100]' },
              { input: '[-7,-3,2,3,11]', expected: '[4,9,9,49,121]' }
            ]
          }
        }
      ]
    },
    {
      id: 'm-sliding-window',
      title: 'Sliding Window',
      description: 'Solve problems using the sliding window technique.',
      topics: ['fixed window', 'variable window', 'subarrays'],
      problem: {
        title: "Longest Substring Without Repeating Characters",
        description: "Given a string s, find the length of the longest substring without repeating characters.",
        difficulty: 'Medium',
        starterCode: "def solution(s):\n    pass",
        testCases: [
          { input: '"abcabcbb"', expected: '3' },
          { input: '"bbbbb"', expected: '1' },
          { input: '"pwwkew"', expected: '3' }
        ]
      },
      children: [
        {
          id: 'm-max-subarray-sum',
          title: 'Maximum Subarray Sum',
          description: 'Find the maximum sum of a subarray of size k.',
          problem: {
            title: "Maximum Sum Subarray",
            description: "Given an integer array of size n, find the maximum sum of a subarray of size k.",
            difficulty: 'Medium',
            starterCode: "def solution(arr, k):\n    pass",
            testCases: [
              { input: '[1,4,2,10,2,3,1,0,20], 4', expected: '24' },
              { input: '[-1], 1', expected: '-1' }
            ]
          }
        },
        {
          id: 'm-min-window-substring',
          title: 'Minimum Window Substring',
          description: 'Find the minimum window containing all characters.',
          problem: {
            title: "Minimum Window Substring",
            description: "Given two strings s and t, return the minimum window in s which will contain all the characters in t. If there is no window, return ''.",
            difficulty: 'Hard',
            starterCode: "def solution(s, t):\n    pass",
            testCases: [
              { input: '"ADOBECODEBANC", "ABC"', expected: '"BANC"' }
            ]
          }
        }
      ]
    },
    {
      id: 'm-hashing',
      title: 'Hashing',
      description: 'Using hash tables and hash maps effectively.',
      topics: ['hash map', 'hash set', 'frequency count'],
      problem: {
        title: "Two Sum",
        description: "Find indices of two numbers that add up to target.",
        difficulty: 'Medium',
        starterCode: "def solution(nums, target):\n    pass",
        testCases: [
          { input: '[2,7,11,15], 9', expected: '[0, 1]' },
          { input: '[3,2,4], 6', expected: '[1, 2]' },
          { input: '[3,3], 6', expected: '[0, 1]' }
        ]
      },
      children: [
        {
          id: 'm-count-elements',
          title: 'Count Frequency',
          description: 'Count frequency of each element.',
          problem: {
            title: "Count Occurrences",
            description: "Write a function that returns a dictionary with the count of each unique element in the array.",
            difficulty: 'Medium',
            starterCode: "def solution(arr):\n    pass",
            testCases: [
              { input: '[1,2,2,3,3,3]', expected: '{1:1, 2:2, 3:3}' },
              { input: '[1,1,1,1]', expected: '{1:4}' }
            ]
          }
        },
        {
          id: 'm-first-unique',
          title: 'First Unique Character',
          description: 'Find the first non-repeating character.',
          problem: {
            title: "First Unique Character",
            description: "Given a string s, find the first non-repeating character and return its index. If it doesn't exist, return -1.",
            difficulty: 'Medium',
            starterCode: "def solution(s):\n    pass",
            testCases: [
              { input: '"leetcode"', expected: '0' },
              { input: '"loveleetcode"', expected: '2' },
              { input: '"aabb"', expected: '-1' }
            ]
          }
        }
      ]
    },
    {
      id: 'm-binary-search',
      title: 'Binary Search',
      description: 'Efficient searching in sorted arrays.',
      topics: ['binary search', 'search space', 'lower bound'],
      problem: {
        title: "Binary Search",
        description: "Implement binary search to find the target in a sorted array. Return the index if found, -1 otherwise.",
        difficulty: 'Medium',
        starterCode: "def solution(nums, target):\n    pass",
        testCases: [
          { input: '[-1,0,3,5,9,12], 9', expected: '4' },
          { input: '[-1,0,3,5,9,12], 2', expected: '-1' }
        ]
      },
      children: [
        {
          id: 'm-lower-bound',
          title: 'Lower Bound',
          description: 'Find the first position where target can be inserted.',
          problem: {
            title: "Search Insert Position",
            description: "Given a sorted array and a target value, return the index if found. If not, return the index where it would be inserted.",
            difficulty: 'Medium',
            starterCode: "def solution(nums, target):\n    pass",
            testCases: [
              { input: '[1,3,5,6], 5', expected: '2' },
              { input: '[1,3,5,6], 2', expected: '1' },
              { input: '[1,3,5,6], 7', expected: '4' }
            ]
          }
        },
        {
          id: 'm-square-root',
          title: 'Square Root',
          description: 'Find the integer square root of a number.',
          problem: {
            title: "Sqrt(x)",
            description: "Given a non-negative integer x, compute and return the square root of x. Return the integer part of the square root.",
            difficulty: 'Medium',
            starterCode: "def solution(x):\n    pass",
            testCases: [
              { input: '4', expected: '2' },
              { input: '8', expected: '2' },
              { input: '0', expected: '0' }
            ]
          }
        }
      ]
    },
    {
      id: 'm-recursion',
      title: 'Recursion Basics',
      description: 'Understanding recursive thinking and base cases.',
      topics: ['base case', 'recursive call', 'stack overflow'],
      problem: {
        title: "Factorial Using Recursion",
        description: "Write a recursive function to calculate the factorial of n.",
        difficulty: 'Medium',
        starterCode: "def solution(n):\n    pass",
        testCases: [
          { input: '5', expected: '120' },
          { input: '0', expected: '1' },
          { input: '3', expected: '6' }
        ]
      },
      children: [
        {
          id: 'm-fib-recursion',
          title: 'Fibonacci Using Recursion',
          description: 'Calculate nth Fibonacci number recursively.',
          problem: {
            title: "Fibonacci Number",
            description: "Write a recursive function to find the nth Fibonacci number. F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)",
            difficulty: 'Medium',
            starterCode: "def solution(n):\n    pass",
            testCases: [
              { input: '2', expected: '1' },
              { input: '3', expected: '2' },
              { input: '4', expected: '3' }
            ]
          }
        },
        {
          id: 'm-sum-digits',
          title: 'Sum of Digits',
          description: 'Sum digits of a number recursively.',
          problem: {
            title: "Sum of Digits",
            description: "Write a recursive function to find the sum of digits of a number.",
            difficulty: 'Medium',
            starterCode: "def solution(n):\n    pass",
            testCases: [
              { input: '123', expected: '6' },
              { input: '999', expected: '27' },
              { input: '0', expected: '0' }
            ]
          }
        },
        {
          id: 'm-reverse-number',
          title: 'Reverse Number',
          description: 'Reverse digits of a number recursively.',
          problem: {
            title: "Reverse Integer",
            description: "Given a signed 32-bit integer x, return x with its digits reversed. If reversing causes overflow, return 0.",
            difficulty: 'Medium',
            starterCode: "def solution(x):\n    pass",
            testCases: [
              { input: '123', expected: '321' },
              { input: '-123', expected: '-321' },
              { input: '120', expected: '21' }
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
      description: 'Solving optimization problems using memoization and tabulation.',
      topics: ['memoization', 'tabulation', 'optimal substructure'],
      problem: {
        title: "Climbing Stairs",
        description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?",
        difficulty: 'Hard',
        starterCode: "def solution(n):\n    pass",
        testCases: [
          { input: '2', expected: '2' },
          { input: '3', expected: '3' },
          { input: '5', expected: '8' }
        ]
      },
      children: [
        {
          id: 'e-fibonacci-dp',
          title: 'Fibonacci DP',
          description: 'Fibonacci using dynamic programming.',
          problem: {
            title: "Fibonacci Number (DP)",
            description: "Find the nth Fibonacci number using dynamic programming. F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)",
            difficulty: 'Hard',
            starterCode: "def solution(n):\n    pass",
            testCases: [
              { input: '10', expected: '55' },
              { input: '20', expected: '6765' }
            ]
          }
        },
        {
          id: 'e-house-robber',
          title: 'House Robber',
          description: 'Maximum money robbed without robbing adjacent houses.',
          problem: {
            title: "House Robber",
            description: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money. You cannot rob two adjacent houses. Find the maximum amount you can rob.",
            difficulty: 'Hard',
            starterCode: "def solution(nums):\n    pass",
            testCases: [
              { input: '[1,2,3,1]', expected: '4' },
              { input: '[2,7,9,3,1]', expected: '12' }
            ]
          }
        },
        {
          id: 'e-coin-change',
          title: 'Coin Change',
          description: 'Minimum coins needed to make an amount.',
          problem: {
            title: "Coin Change",
            description: "Given an array of coin denominations and a target amount, find the minimum number of coins needed to make up that amount. Return -1 if impossible.",
            difficulty: 'Hard',
            starterCode: "def solution(coins, amount):\n    pass",
            testCases: [
              { input: '[1,2,5], 11', expected: '3' },
              { input: '[2], 3', expected: '-1' }
            ]
          }
        },
        {
          id: 'e-longest-common-subseq',
          title: 'Longest Common Subsequence',
          description: 'Find the longest common subsequence between two strings.',
          problem: {
            title: "Longest Common Subsequence",
            description: "Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.",
            difficulty: 'Hard',
            starterCode: "def solution(text1, text2):\n    pass",
            testCases: [
              { input: '"abcde", "ace"', expected: '3' },
              { input: '"abc", "abc"', expected: '3' }
            ]
          }
        },
        {
          id: 'e-longest-increasing-subseq',
          title: 'Longest Increasing Subsequence',
          description: 'Find the length of the longest increasing subsequence.',
          problem: {
            title: "Longest Increasing Subsequence",
            description: "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
            difficulty: 'Hard',
            starterCode: "def solution(nums):\n    pass",
            testCases: [
              { input: '[10,9,2,5,3,7,101,18]', expected: '4' },
              { input: '[0,1,0,3,2,3]', expected: '4' }
            ]
          }
        },
        {
          id: 'e-knapsack',
          title: '0/1 Knapsack',
          description: 'Classic knapsack problem.',
          problem: {
            title: "0/1 Knapsack",
            description: "Given weights and values of items, put some items in a knapsack with capacity W to get the maximum total value.",
            difficulty: 'Hard',
            starterCode: "def solution(W, val, wt):\n    pass",
            testCases: [
              { input: '50, [60,100,120], [10,20,30]', expected: '220' }
            ]
          }
        },
        {
          id: 'e-edit-distance',
          title: 'Edit Distance',
          description: 'Minimum operations to convert one word to another.',
          problem: {
            title: "Edit Distance",
            description: "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2. Operations: insert, delete, replace.",
            difficulty: 'Hard',
            starterCode: "def solution(word1, word2):\n    pass",
            testCases: [
              { input: '"horse", "ros"', expected: '3' },
              { input: '"intention", "execution"', expected: '5' }
            ]
          }
        }
      ]
    },
    {
      id: 'e-graphs',
      title: 'Graph Traversal',
      description: 'BFS and DFS algorithms for graph problems.',
      topics: ['BFS', 'DFS', 'adjacency list', 'visited'],
      problem: {
        title: "Number of Islands",
        description: "Given a 2D grid of 1s (land) and 0s (water), count the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
        difficulty: 'Hard',
        starterCode: "def solution(grid):\n    pass",
        testCases: [
          { input: '[["1","1","1"],["0","1","0"],["1","1","1"]]', expected: '1' },
          { input: '[["1","0","1"],["0","0","0"],["1","0","1"]]', expected: '4' }
        ]
      },
      children: [
        {
          id: 'e-bfs',
          title: 'BFS Traversal',
          description: 'Breadth-first search traversal.',
          problem: {
            title: "Binary Tree Level Order Traversal",
            description: "Given the root of a binary tree, return the level order traversal of its nodes values (left to right, level by level).",
            difficulty: 'Hard',
            starterCode: "def solution(root):\n    pass",
            testCases: [
              { input: '[3,9,20,null,null,15,7]', expected: '[[3],[9,20],[15,7]]' }
            ]
          }
        },
        {
          id: 'e-dfs',
          title: 'DFS Traversal',
          description: 'Depth-first search traversal.',
          problem: {
            title: "Maximum Depth of Binary Tree",
            description: "Given the root of a binary tree, return its maximum depth. A binary trees maximum depth is the number of nodes along the longest path from root to leaf.",
            difficulty: 'Hard',
            starterCode: "def solution(root):\n    pass",
            testCases: [
              { input: '[3,9,20,null,null,15,7]', expected: '3' },
              { input: '[1,null,2]', expected: '2' }
            ]
          }
        },
        {
          id: 'e-graph-cycle',
          title: 'Cycle Detection',
          description: 'Detect cycles in a graph.',
          problem: {
            title: "Course Schedule",
            description: "There are numCourses courses. Some courses may have prerequisites. Determine if it is possible to finish all courses.",
            difficulty: 'Hard',
            starterCode: "def solution(numCourses, prerequisites):\n    pass",
            testCases: [
              { input: '2, [[1,0]]', expected: 'True' },
              { input: '2, [[1,0],[0,1]]', expected: 'False' }
            ]
          }
        },
        {
          id: 'e-shortest-path',
          title: 'Shortest Path',
          description: 'Find shortest path in a graph.',
          problem: {
            title: "Shortest Path in Binary Matrix",
            description: "Given an n x n binary matrix grid, return the length of the shortest clear path in the matrix. A clear path is a path from (0,0) to (n-1,n-1) with no 1s.",
            difficulty: 'Hard',
            starterCode: "def solution(grid):\n    pass",
            testCases: [
              { input: '[[0,1],[1,0]]', expected: '2' },
              { input: '[[0,0,0],[1,1,0],[1,1,0]]', expected: '4' }
            ]
          }
        }
      ]
    },
    {
      id: 'e-trees',
      title: 'Trees',
      description: 'Binary trees and binary search trees operations.',
      topics: ['binary tree', 'BST', 'traversal', 'search', 'insert'],
      problem: {
        title: "Binary Tree Inorder Traversal",
        description: "Given the root of a binary tree, return the inorder traversal of its nodes values (left, root, right).",
        difficulty: 'Hard',
        starterCode: "def solution(root):\n    pass",
        testCases: [
          { input: '[1,null,2,3]', expected: '[1,3,2]' },
          { input: '[]', expected: '[]' }
        ]
      },
      children: [
        {
          id: 'e-tree-preorder',
          title: 'Preorder Traversal',
          description: 'Root, left, right traversal.',
          problem: {
            title: "Binary Tree Preorder Traversal",
            description: "Given the root of a binary tree, return the preorder traversal of its nodes values (root, left, right).",
            difficulty: 'Hard',
            starterCode: "def solution(root):\n    pass",
            testCases: [
              { input: '[1,null,2,3]', expected: '[1,2,3]' },
              { input: '[]', expected: '[]' }
            ]
          }
        },
        {
          id: 'e-tree-postorder',
          title: 'Postorder Traversal',
          description: 'Left, right, root traversal.',
          problem: {
            title: "Binary Tree Postorder Traversal",
            description: "Given the root of a binary tree, return the postorder traversal of its nodes values (left, right, root).",
            difficulty: 'Hard',
            starterCode: "def solution(root):\n    pass",
            testCases: [
              { input: '[1,null,2,3]', expected: '[3,2,1]' },
              { input: '[]', expected: '[]' }
            ]
          }
        },
        {
          id: 'e-bst-insert',
          title: 'BST Insertion',
          description: 'Insert a node in BST.',
          problem: {
            title: "Insert into BST",
            description: "Given the root of a BST and a value to insert, insert the value into the BST. Return the root of the BST.",
            difficulty: 'Hard',
            starterCode: "def solution(root, val):\n    pass",
            testCases: [
              { input: '[4,2,7,1,3], 5', expected: '[4,2,7,1,3,5]' }
            ]
          }
        },
        {
          id: 'e-validate-bst',
          title: 'Validate BST',
          description: 'Check if a tree is a valid binary search tree.',
          problem: {
            title: "Validate Binary Search Tree",
            description: "Given the root of a binary tree, determine if it is a valid BST. A valid BST has left subtree with values less than root, and right subtree with values greater than root.",
            difficulty: 'Hard',
            starterCode: "def solution(root):\n    pass",
            testCases: [
              { input: '[2,1,3]', expected: 'True' },
              { input: '[5,1,4,null,null,3,6]', expected: 'False' }
            ]
          }
        },
        {
          id: 'e-lowest-common-ancestor',
          title: 'Lowest Common Ancestor',
          description: 'Find LCA in a binary tree.',
          problem: {
            title: "Lowest Common Ancestor",
            description: "Given a binary tree and two nodes, find the lowest common ancestor of the two nodes.",
            difficulty: 'Hard',
            starterCode: "def solution(root, p, q):\n    pass",
            testCases: [
              { input: '[3,5,1,6,2,0,8,null,null,7,4], 5, 1', expected: '3' }
            ]
          }
        }
      ]
    },
    {
      id: 'e-backtracking',
      title: 'Backtracking',
      description: 'Exploring all possibilities and undoing choices.',
      topics: ['recursion', 'choice', 'constraints', 'undo'],
      problem: {
        title: "Subsets",
        description: "Given an integer array nums of unique elements, return all possible subsets (the power set).",
        difficulty: 'Hard',
        starterCode: "def solution(nums):\n    pass",
        testCases: [
          { input: '[1,2,3]', expected: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]' },
          { input: '[0]', expected: '[[],[0]]' }
        ]
      },
      children: [
        {
          id: 'e-permutations',
          title: 'Permutations',
          description: 'Generate all permutations of an array.',
          problem: {
            title: "Permutations",
            description: "Given an array nums of distinct integers, return all possible permutations of nums.",
            difficulty: 'Hard',
            starterCode: "def solution(nums):\n    pass",
            testCases: [
              { input: '[1,2,3]', expected: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]' }
            ]
          }
        },
        {
          id: 'e-combinations',
          title: 'Combinations',
          description: 'Generate all combinations of k elements.',
          problem: {
            title: "Combinations",
            description: "Given two integers n and k, return all possible combinations of k numbers from 1 to n.",
            difficulty: 'Hard',
            starterCode: "def solution(n, k):\n    pass",
            testCases: [
              { input: '4, 2', expected: '[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]' }
            ]
          }
        },
        {
          id: 'e-n-queens',
          title: 'N-Queens',
          description: 'Place N queens on NxN chessboard.',
          problem: {
            title: "N-Queens",
            description: "Solve the N-Queens puzzle - place n queens on an n x n chessboard so no two queens attack each other.",
            difficulty: 'Hard',
            starterCode: "def solution(n):\n    pass",
            testCases: [
              { input: '4', expected: '[["Q...",".Q..","..Q.","...Q"],["...Q","..Q.",".Q..","Q..."]]' }
            ]
          }
        },
        {
          id: 'e-word-search',
          title: 'Word Search',
          description: 'Find if a word exists in a grid.',
          problem: {
            title: "Word Search",
            description: "Given an m x n grid of letters and a word, return True if the word exists in the grid. The word can be constructed from letters in sequentially adjacent cells.",
            difficulty: 'Hard',
            starterCode: "def solution(board, word):\n    pass",
            testCases: [
              { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], "ABCCED"', expected: 'True' },
              { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], "SEE"', expected: 'True' }
            ]
          }
        }
      ]
    }
  ]
};

