-- =============================================================
-- Exam schema: exams, exam_questions, exam_test_cases
-- Run this in Supabase SQL Editor (project dashboard -> SQL).
-- Safe to re-run: drops & recreates the exam* tables.
-- exam_questions.drivers: jsonb map { lang -> driver template } with
-- placeholders {USER_CODE} and {INPUT} substituted at run time.
-- =============================================================

drop table if exists public.exam_test_cases cascade;
drop table if exists public.exam_questions cascade;
drop table if exists public.exams cascade;

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  duration_minutes int not null default 60,
  total_marks int not null default 100,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

create table public.exam_questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  position int not null default 0,
  title text not null,
  description text not null,
  difficulty text not null check (difficulty in ('easy','medium','hard')),
  marks int not null default 10,
  starter_codes jsonb not null default '{}'::jsonb,
  drivers jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create index exam_questions_exam_position_idx
  on public.exam_questions (exam_id, position);

create table public.exam_test_cases (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.exam_questions(id) on delete cascade,
  position int not null default 0,
  input text not null,
  expected_output text not null,
  is_sample boolean not null default false,
  created_at timestamptz default now()
);

create index exam_test_cases_question_position_idx
  on public.exam_test_cases (question_id, position);

-- RLS: anyone (including anon) can read active exams and their data.
alter table public.exams enable row level security;
alter table public.exam_questions enable row level security;
alter table public.exam_test_cases enable row level security;

create policy "Read active exams"
  on public.exams for select
  using (is_active = true);

create policy "Read active exam questions"
  on public.exam_questions for select
  using (exists (
    select 1 from public.exams e
    where e.id = exam_questions.exam_id and e.is_active = true
  ));

create policy "Read active exam test cases"
  on public.exam_test_cases for select
  using (exists (
    select 1 from public.exam_questions q
    join public.exams e on e.id = q.exam_id
    where q.id = exam_test_cases.question_id and e.is_active = true
  ));

-- =============================================================
-- Seed: 1 exam, 3 questions (with drivers), 27 test cases each
-- =============================================================

with exam as (
  insert into public.exams (title, description, duration_minutes, total_marks, is_active)
  values (
    'Data Structures & Algorithms Exam',
    'Comprehensive exam covering arrays, strings, and basic algorithms',
    60, 100, true
  )
  returning id
),
q1 as (
  insert into public.exam_questions (exam_id, position, title, description, difficulty, marks, starter_codes, drivers)
  select id, 1,
    'Array Sum Problem',
    'Given an array of integers "nums", find the sum of all elements.',
    'easy', 30,
    jsonb_build_object(
      'python', $stp$class Solution(object):
    def arraySum(self, nums):
        """
        :type nums: List[int]
        :rtype: int
        """
        # Write your logic here
        return 0$stp$,
      'javascript', $stj$class Solution {
    /**
     * @param {number[]} nums
     * @return {number}
     */
    arraySum(nums) {
        // Write your code here
        return 0;
    }
}$stj$,
      'java', $stja$class Solution {
    public int arraySum(int[] nums) {
        // Write your code here
        return 0;
    }
}$stja$,
      'cpp', $stc$#include <vector>
using namespace std;

class Solution {
public:
    int arraySum(vector<int>& nums) {
        // Write your code here
        return 0;
    }
};$stc$
    ),
    jsonb_build_object(
      'python', $drp$import json

{USER_CODE}

if __name__ == "__main__":
    nums = json.loads("{INPUT}")
    print(Solution().arraySum(nums))
$drp$,
      'javascript', $drj$
{USER_CODE}

const nums = JSON.parse("{INPUT}");
console.log((new Solution()).arraySum(nums));
$drj$,
      'java', $drja$import java.util.*;

{USER_CODE}

public class Main {
    public static void main(String[] args) {
        String input = "{INPUT}";
        String cleaned = input.replaceAll("[\\[\\]\\s]", "");
        int[] nums = cleaned.isEmpty()
            ? new int[0]
            : Arrays.stream(cleaned.split(",")).mapToInt(Integer::parseInt).toArray();
        System.out.println(new Solution().arraySum(nums));
    }
}
$drja$,
      'cpp', $drc$#include <iostream>
#include <sstream>
#include <vector>
#include <string>
using namespace std;

{USER_CODE}

int main() {
    string input = "{INPUT}";
    string cleaned;
    for (char c : input) {
        if (c != '[' && c != ']' && c != ' ') cleaned += c;
    }
    vector<int> nums;
    if (!cleaned.empty()) {
        stringstream ss(cleaned);
        string token;
        while (getline(ss, token, ',')) {
            if (!token.empty()) nums.push_back(stoi(token));
        }
    }
    cout << Solution().arraySum(nums) << endl;
    return 0;
}
$drc$
    )
  from exam
  returning id
),
q2 as (
  insert into public.exam_questions (exam_id, position, title, description, difficulty, marks, starter_codes, drivers)
  select id, 2,
    'String Palindrome',
    'Check if a given string "s" is a palindrome (reads the same forwards and backwards).',
    'medium', 40,
    jsonb_build_object(
      'python', $stp$class Solution(object):
    def isPalindrome(self, s):
        """
        :type s: str
        :rtype: bool
        """
        # Write your logic here
        return False$stp$,
      'javascript', $stj$class Solution {
    /**
     * @param {string} s
     * @return {boolean}
     */
    isPalindrome(s) {
        // Write your code here
        return false;
    }
}$stj$,
      'java', $stja$class Solution {
    public boolean isPalindrome(String s) {
        // Write your code here
        return false;
    }
}$stja$,
      'cpp', $stc$#include <string>
using namespace std;

class Solution {
public:
    bool isPalindrome(string s) {
        // Write your code here
        return false;
    }
};$stc$
    ),
    jsonb_build_object(
      'python', $drp$import json

{USER_CODE}

if __name__ == "__main__":
    s = json.loads("{INPUT}")
    print("true" if Solution().isPalindrome(s) else "false")
$drp$,
      'javascript', $drj$
{USER_CODE}

const s = JSON.parse("{INPUT}");
console.log((new Solution()).isPalindrome(s));
$drj$,
      'java', $drja$
{USER_CODE}

public class Main {
    public static void main(String[] args) {
        String input = "{INPUT}";
        String s = input.substring(1, input.length() - 1);
        System.out.println(new Solution().isPalindrome(s));
    }
}
$drja$,
      'cpp', $drc$#include <iostream>
#include <string>
using namespace std;

{USER_CODE}

int main() {
    string input = "{INPUT}";
    string s = input.substr(1, input.length() - 2);
    cout << (Solution().isPalindrome(s) ? "true" : "false") << endl;
    return 0;
}
$drc$
    )
  from exam
  returning id
),
q3 as (
  insert into public.exam_questions (exam_id, position, title, description, difficulty, marks, starter_codes, drivers)
  select id, 3,
    'Binary Search',
    'Implement binary search to find "target" in sorted array "arr". Return the index or -1.',
    'hard', 30,
    jsonb_build_object(
      'python', $stp$class Solution(object):
    def search(self, arr, target):
        """
        :type arr: List[int]
        :type target: int
        :rtype: int
        """
        # Write your logic here
        return -1$stp$,
      'javascript', $stj$class Solution {
    /**
     * @param {number[]} arr
     * @param {number} target
     * @return {number}
     */
    search(arr, target) {
        // Write your code here
        return -1;
    }
}$stj$,
      'java', $stja$class Solution {
    public int search(int[] arr, int target) {
        // Write your code here
        return -1;
    }
}$stja$,
      'cpp', $stc$#include <vector>
using namespace std;

class Solution {
public:
    int search(vector<int>& arr, int target) {
        // Write your code here
        return -1;
    }
};$stc$
    ),
    jsonb_build_object(
      'python', $drp$import re, json

{USER_CODE}

if __name__ == "__main__":
    input_str = "{INPUT}"
    m1 = re.search(r"arr=(\[[^\]]*\])", input_str)
    m2 = re.search(r"target=(-?\d+)", input_str)
    arr = json.loads(m1.group(1))
    target = int(m2.group(1))
    print(Solution().search(arr, target))
$drp$,
      'javascript', $drj$
{USER_CODE}

const input = "{INPUT}";
const arrMatch = input.match(/arr=(\[[^\]]*\])/);
const targetMatch = input.match(/target=(-?\d+)/);
const arr = JSON.parse(arrMatch[1]);
const target = parseInt(targetMatch[1]);
console.log((new Solution()).search(arr, target));
$drj$,
      'java', $drja$import java.util.*;
import java.util.regex.*;

{USER_CODE}

public class Main {
    public static void main(String[] args) {
        String input = "{INPUT}";
        Matcher m1 = Pattern.compile("arr=\\[([^\\]]*)\\]").matcher(input);
        Matcher m2 = Pattern.compile("target=(-?\\d+)").matcher(input);
        m1.find();
        m2.find();
        String arrStr = m1.group(1);
        int[] arr = arrStr.isEmpty()
            ? new int[0]
            : Arrays.stream(arrStr.split(",")).map(String::trim).mapToInt(Integer::parseInt).toArray();
        int target = Integer.parseInt(m2.group(1));
        System.out.println(new Solution().search(arr, target));
    }
}
$drja$,
      'cpp', $drc$#include <iostream>
#include <sstream>
#include <vector>
#include <string>
#include <regex>
using namespace std;

{USER_CODE}

int main() {
    string input = "{INPUT}";
    smatch m1, m2;
    regex_search(input, m1, regex("arr=\\[([^\\]]*)\\]"));
    regex_search(input, m2, regex("target=(-?\\d+)"));
    string arrStr = m1[1].str();
    vector<int> arr;
    if (!arrStr.empty()) {
        stringstream ss(arrStr);
        string token;
        while (getline(ss, token, ',')) {
            if (!token.empty()) arr.push_back(stoi(token));
        }
    }
    int target = stoi(m2[1].str());
    cout << Solution().search(arr, target) << endl;
    return 0;
}
$drc$
    )
  from exam
  returning id
)
insert into public.exam_test_cases (question_id, position, input, expected_output, is_sample)
select q1.id, t.pos, t.inp, t.out, t.pos <= 2 from q1, (values
  (1, '[1, 2, 3, 4, 5]', '15'),
  (2, '[-1, 0, 1]', '0'),
  (3, '[0]', '0'),
  (4, '[100]', '100'),
  (5, '[-100]', '-100'),
  (6, '[]', '0'),
  (7, '[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]', '10'),
  (8, '[-1, -2, -3, -4, -5]', '-15'),
  (9, '[10, 20, 30, 40, 50]', '150'),
  (10, '[2, 4, 6, 8, 10]', '30'),
  (11, '[1, -1, 2, -2, 3, -3]', '0'),
  (12, '[1000, 2000, 3000]', '6000'),
  (13, '[7]', '7'),
  (14, '[-50, 50]', '0'),
  (15, '[5, 10, 15, 20, 25, 30]', '105'),
  (16, '[99, 1]', '100'),
  (17, '[-10, -20, -30]', '-60'),
  (18, '[1, 2, 3]', '6'),
  (19, '[500, 500]', '1000'),
  (20, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]', '55'),
  (21, '[0, 0, 0, 0, 0]', '0'),
  (22, '[1]', '1'),
  (23, '[-1]', '-1'),
  (24, '[123, 456, 789]', '1368'),
  (25, '[10, -10, 20, -20]', '0'),
  (26, '[42, 42, 42]', '126'),
  (27, '[-5, 0, 5]', '0')
) as t(pos, inp, out)
union all
select q2.id, t.pos, t.inp, t.out, t.pos <= 2 from q2, (values
  (1, '"racecar"', 'true'),
  (2, '"hello"', 'false'),
  (3, '"a"', 'true'),
  (4, '"ab"', 'false'),
  (5, '"aa"', 'true'),
  (6, '"abba"', 'true'),
  (7, '"abc"', 'false'),
  (8, '"level"', 'true'),
  (9, '"world"', 'false'),
  (10, '"madam"', 'true'),
  (11, '"python"', 'false'),
  (12, '"noon"', 'true'),
  (13, '"apple"', 'false'),
  (14, '"refer"', 'true'),
  (15, '"stats"', 'true'),
  (16, '"rotor"', 'true'),
  (17, '"civic"', 'true'),
  (18, '"kayak"', 'true'),
  (19, '"abcba"', 'true'),
  (20, '"abcdef"', 'false'),
  (21, '"xyzzyx"', 'true'),
  (22, '"test"', 'false'),
  (23, '"pop"', 'true'),
  (24, '"wow"', 'true'),
  (25, '"abab"', 'false'),
  (26, '"deed"', 'true'),
  (27, '"reviver"', 'true')
) as t(pos, inp, out)
union all
select q3.id, t.pos, t.inp, t.out, t.pos <= 2 from q3, (values
  (1, 'arr=[1,2,3,4,5], target=3', '2'),
  (2, 'arr=[1,2,3,4,5], target=6', '-1'),
  (3, 'arr=[1,2,3,4,5], target=1', '0'),
  (4, 'arr=[1,2,3,4,5], target=5', '4'),
  (5, 'arr=[10,20,30,40,50], target=30', '2'),
  (6, 'arr=[10,20,30,40,50], target=10', '0'),
  (7, 'arr=[10,20,30,40,50], target=50', '4'),
  (8, 'arr=[10,20,30,40,50], target=25', '-1'),
  (9, 'arr=[1], target=1', '0'),
  (10, 'arr=[1], target=2', '-1'),
  (11, 'arr=[1,3,5,7,9,11], target=7', '3'),
  (12, 'arr=[1,3,5,7,9,11], target=11', '5'),
  (13, 'arr=[1,3,5,7,9,11], target=1', '0'),
  (14, 'arr=[1,3,5,7,9,11], target=4', '-1'),
  (15, 'arr=[2,4,6,8,10,12,14], target=8', '3'),
  (16, 'arr=[2,4,6,8,10,12,14], target=14', '6'),
  (17, 'arr=[2,4,6,8,10,12,14], target=1', '-1'),
  (18, 'arr=[-5,-3,-1,0,2,4,6], target=0', '3'),
  (19, 'arr=[-5,-3,-1,0,2,4,6], target=-5', '0'),
  (20, 'arr=[-5,-3,-1,0,2,4,6], target=6', '6'),
  (21, 'arr=[-5,-3,-1,0,2,4,6], target=-2', '-1'),
  (22, 'arr=[100,200,300,400,500], target=200', '1'),
  (23, 'arr=[100,200,300,400,500], target=500', '4'),
  (24, 'arr=[100,200,300,400,500], target=1000', '-1'),
  (25, 'arr=[1,2,3,4,5,6,7,8,9,10], target=10', '9'),
  (26, 'arr=[1,2,3,4,5,6,7,8,9,10], target=1', '0'),
  (27, 'arr=[1,2,3,4,5,6,7,8,9,10], target=5', '4')
) as t(pos, inp, out);
