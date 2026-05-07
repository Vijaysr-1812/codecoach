-- =============================================================
-- Initial Assessment seed for the current CodeCoach schema.
-- Inserts one active exam, three coding questions, and test cases.
-- Safe to rerun: skips if an Initial Assessment already exists.
-- =============================================================

do $$
declare
  v_exam_id uuid;
  v_q_reverse uuid;
  v_q_fizzbuzz uuid;
  v_q_palindrome uuid;
begin
  if exists (select 1 from public.exams where title = 'Initial Assessment') then
    return;
  end if;

  insert into public.exams (title, description, duration, total_marks, difficulty, is_active)
  values (
    'Initial Assessment',
    'A short coding assessment covering string handling, conditionals, and loops.',
    45,
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
    'Reverse a String',
    'Given a string s, return the reversed string.',
    'easy',
    30,
    jsonb_build_object(
      'python', 'def solution(s):' || chr(10) || '    pass',
      'javascript', 'function solution(s) {' || chr(10) || '  return "";' || chr(10) || '}',
      'java', 'class Solution {' || chr(10) || '    public String solution(String s) {' || chr(10) || '        return "";' || chr(10) || '    }' || chr(10) || '}',
      'cpp', '#include <string>' || chr(10) || 'using namespace std;' || chr(10) || 'string solution(string s) {' || chr(10) || '    return "";' || chr(10) || '}'
    ),
    jsonb_build_object(
      'python', '{USER_CODE}' || chr(10) || 'print(solution("{INPUT}"))',
      'javascript', '{USER_CODE}' || chr(10) || 'console.log(solution("{INPUT}"));',
      'java', '{USER_CODE}' || chr(10) || 'class Main {' || chr(10) || '  public static void main(String[] args) {' || chr(10) || '    System.out.println(new Solution().solution("{INPUT}"));' || chr(10) || '  }' || chr(10) || '}',
      'cpp', '#include <bits/stdc++.h>' || chr(10) || 'using namespace std;' || chr(10) || '{USER_CODE}' || chr(10) || 'int main() {' || chr(10) || '  cout << solution("{INPUT}");' || chr(10) || '}'
    )
  )
  returning id into v_q_reverse;

  insert into public.exam_test_cases (question_id, position, input, expected_output, is_hidden)
  values
    (v_q_reverse, 1, 'hello', 'olleh', false),
    (v_q_reverse, 2, 'CodeCoach', 'hcaoCedoC', false),
    (v_q_reverse, 3, 'racecar', 'racecar', true);

  insert into public.exam_questions (
    exam_id, position, title, description, difficulty, marks, starter_code, drivers
  )
  values (
    v_exam_id,
    2,
    'FizzBuzz',
    'Given an integer n, return a comma-separated FizzBuzz sequence from 1 to n.',
    'easy',
    35,
    jsonb_build_object(
      'python', 'def solution(n):' || chr(10) || '    pass',
      'javascript', 'function solution(n) {' || chr(10) || '  return "";' || chr(10) || '}',
      'java', 'class Solution {' || chr(10) || '    public String solution(int n) {' || chr(10) || '        return "";' || chr(10) || '    }' || chr(10) || '}',
      'cpp', '#include <string>' || chr(10) || 'using namespace std;' || chr(10) || 'string solution(int n) {' || chr(10) || '    return "";' || chr(10) || '}'
    ),
    jsonb_build_object(
      'python', '{USER_CODE}' || chr(10) || 'print(solution(int("{INPUT}")))',
      'javascript', '{USER_CODE}' || chr(10) || 'console.log(solution(Number("{INPUT}")));',
      'java', '{USER_CODE}' || chr(10) || 'class Main {' || chr(10) || '  public static void main(String[] args) {' || chr(10) || '    System.out.println(new Solution().solution(Integer.parseInt("{INPUT}")));' || chr(10) || '  }' || chr(10) || '}',
      'cpp', '#include <bits/stdc++.h>' || chr(10) || 'using namespace std;' || chr(10) || '{USER_CODE}' || chr(10) || 'int main() {' || chr(10) || '  cout << solution(stoi("{INPUT}"));' || chr(10) || '}'
    )
  )
  returning id into v_q_fizzbuzz;

  insert into public.exam_test_cases (question_id, position, input, expected_output, is_hidden)
  values
    (v_q_fizzbuzz, 1, '5', '1,2,Fizz,4,Buzz', false),
    (v_q_fizzbuzz, 2, '15', '1,2,Fizz,4,Buzz,Fizz,7,8,Fizz,Buzz,11,Fizz,13,14,FizzBuzz', false),
    (v_q_fizzbuzz, 3, '3', '1,2,Fizz', true);

  insert into public.exam_questions (
    exam_id, position, title, description, difficulty, marks, starter_code, drivers
  )
  values (
    v_exam_id,
    3,
    'Palindrome Check',
    'Given a string s, return True if it is a palindrome, otherwise False.',
    'easy',
    35,
    jsonb_build_object(
      'python', 'def solution(s):' || chr(10) || '    pass',
      'javascript', 'function solution(s) {' || chr(10) || '  return false;' || chr(10) || '}',
      'java', 'class Solution {' || chr(10) || '    public boolean solution(String s) {' || chr(10) || '        return false;' || chr(10) || '    }' || chr(10) || '}',
      'cpp', '#include <string>' || chr(10) || 'using namespace std;' || chr(10) || 'bool solution(string s) {' || chr(10) || '    return false;' || chr(10) || '}'
    ),
    jsonb_build_object(
      'python', '{USER_CODE}' || chr(10) || 'print(solution("{INPUT}"))',
      'javascript', '{USER_CODE}' || chr(10) || 'console.log(solution("{INPUT}") ? "True" : "False");',
      'java', '{USER_CODE}' || chr(10) || 'class Main {' || chr(10) || '  public static void main(String[] args) {' || chr(10) || '    System.out.println(new Solution().solution("{INPUT}") ? "True" : "False");' || chr(10) || '  }' || chr(10) || '}',
      'cpp', '#include <bits/stdc++.h>' || chr(10) || 'using namespace std;' || chr(10) || '{USER_CODE}' || chr(10) || 'int main() {' || chr(10) || '  cout << (solution("{INPUT}") ? "True" : "False");' || chr(10) || '}'
    )
  )
  returning id into v_q_palindrome;

  insert into public.exam_test_cases (question_id, position, input, expected_output, is_hidden)
  values
    (v_q_palindrome, 1, 'madam', 'True', false),
    (v_q_palindrome, 2, 'hello', 'False', false),
    (v_q_palindrome, 3, 'level', 'True', true);
end $$;
