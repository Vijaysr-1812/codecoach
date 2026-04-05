export interface ExamTestCase {
  input: string;
  expectedOutput: string;
}

export interface ExamQuestion {
  id: string;
  title: string;
  topic: string;
  executionType: 'array_int' | 'string_bool' | 'array_target';
  description: string;
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  starterCode?: string;
  testCases: ExamTestCase[];
}

export interface ExamData {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  questions: ExamQuestion[];
  isActive: boolean;
}

const LOCAL_EXAMS: Record<string, ExamData> = {
  default: {
    id: '1',
    title: 'Data Structures & Algorithms Exam',
    description: 'Comprehensive exam covering arrays, strings, and basic algorithms',
    duration: 60,
    totalMarks: 100,
    isActive: true,
    questions: [
      {
        id: '1',
        title: 'Array Sum Problem',
        topic: 'Arrays',
        executionType: 'array_int',
        description: 'Given an array of integers "nums", find the sum of all elements.',
        marks: 20,
        difficulty: 'easy',
        starterCode: `class Solution(object):
    def solve(self, nums):
        return sum(nums)`,
        testCases: [
          { input: '[1,2,3,4]', expectedOutput: '10' }
        ]
      },
      {
        id: '2',
        title: 'String Palindrome',
        topic: 'Strings',
        executionType: 'string_bool',
        description: 'Check if string is palindrome.',
        marks: 20,
        difficulty: 'easy',
        starterCode: `class Solution(object):
    def solve(self, s):
        return s == s[::-1]`,
        testCases: [
          { input: '"madam"', expectedOutput: 'true' }
        ]
      },
      {
        id: '3',
        title: 'Binary Search',
        topic: 'Binary Search',
        executionType: 'array_target',
        description: 'Find target in sorted array.',
        marks: 20,
        difficulty: 'medium',
        starterCode: `class Solution(object):
    def solve(self, arr, target):
        l, r = 0, len(arr)-1
        while l<=r:
            m=(l+r)//2
            if arr[m]==target: return m
            elif arr[m]<target: l=m+1
            else: r=m-1
        return -1`,
        testCases: [
          { input: 'arr=[1,2,3,4], target=3', expectedOutput: '2' }
        ]
      },
      {
        id: '4',
        title: 'Two Sum',
        topic: 'Hashing',
        executionType: 'array_target',
        description: 'Find indices of two numbers that sum to target.',
        marks: 20,
        difficulty: 'medium',
        starterCode: `class Solution(object):
    def solve(self, arr, target):
        d={}
        for i,n in enumerate(arr):
            if target-n in d:
                return [d[target-n], i]
            d[n]=i`,
        testCases: [
          { input: 'arr=[2,7,11], target=9', expectedOutput: '[0,1]' }
        ]
      },
      {
        id: '5',
        title: 'Reverse String Check',
        topic: 'Strings',
        executionType: 'string_bool',
        description: 'Check if reverse equals original.',
        marks: 20,
        difficulty: 'easy',
        starterCode: `class Solution(object):
    def solve(self, s):
        return s[::-1] == s`,
        testCases: [
          { input: '"racecar"', expectedOutput: 'true' }
        ]
      }
    ]
  }
};

export async function loadExamDefinition(examId = 'default'): Promise<ExamData> {
  return LOCAL_EXAMS[examId] || LOCAL_EXAMS.default;
}
