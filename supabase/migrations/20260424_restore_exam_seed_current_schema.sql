-- =============================================================
-- Restore Examination data for the consolidated/current schema.
-- Uses: exams.duration, exam_questions.starter_code, exam_test_cases.is_hidden.
-- Safe to rerun: only inserts when no active exam exists.
-- =============================================================

do $$
declare
  v_exam_id uuid;
  v_q1 uuid;
  v_q2 uuid;
begin
  if exists (select 1 from public.exams where is_active = true) then
    return;
  end if;

  insert into public.exams (title, description, duration, total_marks, difficulty, is_active)
  values (
    'Data Structures & Algorithms Exam',
    'Comprehensive exam covering arrays, strings, and basic algorithms',
    60,
    100,
    'mixed',
    true
  )
  returning id into v_exam_id;

  insert into public.exam_questions (
    exam_id, position, title, description, difficulty, marks, starter_code, drivers
  )
  values (
    v_exam_id,
    1,
    'Array Sum Problem',
    'Given an array of integers nums, return the sum of all elements.',
    'easy',
    50,
    jsonb_build_object(
      'python', 'class Solution(object):' || chr(10) ||
                '    def arraySum(self, nums):' || chr(10) ||
                '        return 0',
      'javascript', 'class Solution {' || chr(10) ||
                    '  arraySum(nums) {' || chr(10) ||
                    '    return 0;' || chr(10) ||
                    '  }' || chr(10) ||
                    '}',
      'java', 'class Solution {' || chr(10) ||
              '    public int arraySum(int[] nums) {' || chr(10) ||
              '        return 0;' || chr(10) ||
              '    }' || chr(10) ||
              '}',
      'cpp', '#include <vector>' || chr(10) ||
             'using namespace std;' || chr(10) ||
             'class Solution {' || chr(10) ||
             'public:' || chr(10) ||
             '    int arraySum(vector<int>& nums) {' || chr(10) ||
             '        return 0;' || chr(10) ||
             '    }' || chr(10) ||
             '};'
    ),
    jsonb_build_object(
      'python', 'import json' || chr(10) ||
                '{USER_CODE}' || chr(10) ||
                'nums = json.loads("{INPUT}")' || chr(10) ||
                'print(Solution().arraySum(nums))',
      'javascript', '{USER_CODE}' || chr(10) ||
                    'const nums = JSON.parse("{INPUT}");' || chr(10) ||
                    'console.log(new Solution().arraySum(nums));',
      'java', 'import java.util.*;' || chr(10) ||
              '{USER_CODE}' || chr(10) ||
              'class Main {' || chr(10) ||
              '  public static void main(String[] args) {' || chr(10) ||
              '    String raw = "{INPUT}".replace("[", "").replace("]", "").trim();' || chr(10) ||
              '    if (raw.isEmpty()) { System.out.println(0); return; }' || chr(10) ||
              '    String[] parts = raw.split(",");' || chr(10) ||
              '    int[] nums = new int[parts.length];' || chr(10) ||
              '    for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i].trim());' || chr(10) ||
              '    System.out.println(new Solution().arraySum(nums));' || chr(10) ||
              '  }' || chr(10) ||
              '}',
      'cpp', '#include <bits/stdc++.h>' || chr(10) ||
             'using namespace std;' || chr(10) ||
             '{USER_CODE}' || chr(10) ||
             'int main() {' || chr(10) ||
             '  string s = "{INPUT}";' || chr(10) ||
             '  vector<int> nums; string num;' || chr(10) ||
             '  for (char c : s) {' || chr(10) ||
             '    if ((c >= ''0'' && c <= ''9'') || c == ''-'') num += c;' || chr(10) ||
             '    else if (!num.empty()) { nums.push_back(stoi(num)); num.clear(); }' || chr(10) ||
             '  }' || chr(10) ||
             '  if (!num.empty()) nums.push_back(stoi(num));' || chr(10) ||
             '  cout << Solution().arraySum(nums);' || chr(10) ||
             '}'
    )
  )
  returning id into v_q1;

  insert into public.exam_test_cases (question_id, position, input, expected_output, is_hidden)
  values
    (v_q1, 1, '[1,2,3]', '6', false),
    (v_q1, 2, '[10,-2,5]', '13', false),
    (v_q1, 3, '[]', '0', true);

  insert into public.exam_questions (
    exam_id, position, title, description, difficulty, marks, starter_code, drivers
  )
  values (
    v_exam_id,
    2,
    'Reverse String',
    'Given a string s, return the reversed string.',
    'easy',
    50,
    jsonb_build_object(
      'python', 'class Solution(object):' || chr(10) ||
                '    def reverseString(self, s):' || chr(10) ||
                '        return ""',
      'javascript', 'class Solution {' || chr(10) ||
                    '  reverseString(s) {' || chr(10) ||
                    '    return "";' || chr(10) ||
                    '  }' || chr(10) ||
                    '}',
      'java', 'class Solution {' || chr(10) ||
              '    public String reverseString(String s) {' || chr(10) ||
              '        return "";' || chr(10) ||
              '    }' || chr(10) ||
              '}',
      'cpp', '#include <string>' || chr(10) ||
             'using namespace std;' || chr(10) ||
             'class Solution {' || chr(10) ||
             'public:' || chr(10) ||
             '    string reverseString(string s) {' || chr(10) ||
             '        return "";' || chr(10) ||
             '    }' || chr(10) ||
             '};'
    ),
    jsonb_build_object(
      'python', '{USER_CODE}' || chr(10) ||
                'print(Solution().reverseString("{INPUT}"))',
      'javascript', '{USER_CODE}' || chr(10) ||
                    'console.log(new Solution().reverseString("{INPUT}"));',
      'java', '{USER_CODE}' || chr(10) ||
              'class Main {' || chr(10) ||
              '  public static void main(String[] args) {' || chr(10) ||
              '    System.out.println(new Solution().reverseString("{INPUT}"));' || chr(10) ||
              '  }' || chr(10) ||
              '}',
      'cpp', '#include <bits/stdc++.h>' || chr(10) ||
             'using namespace std;' || chr(10) ||
             '{USER_CODE}' || chr(10) ||
             'int main() {' || chr(10) ||
             '  cout << Solution().reverseString("{INPUT}");' || chr(10) ||
             '}'
    )
  )
  returning id into v_q2;

  insert into public.exam_test_cases (question_id, position, input, expected_output, is_hidden)
  values
    (v_q2, 1, 'hello', 'olleh', false),
    (v_q2, 2, 'CodeCoach', 'hcaoCedoC', false),
    (v_q2, 3, 'abc', 'cba', true);
end $$;
