---
title: "Leetcode 刷题"
layout: page
date: 2099-06-02 00:00
---
# Leetcode 刷题
[toc]

## 306. 累加数

>累加数是一个字符串，组成它的数字可以形成累加序列。
一个有效的累加序列必须至少包含 3 个数。除了最开始的两个数以外，字符串中的其他数都等于它之前两个数相加的和。
给定一个只包含数字 '0'-'9' 的字符串，编写一个算法来判断给定输入是否是累加数。
说明: 累加序列里的数不会以 0 开头，所以不会出现 1, 2, 03 或者 1, 02, 3 的情况。
示例 1:
输入: "112358"输出: true
解释: 累加序列为: 1, 1, 2, 3, 5, 8 。1 + 1 = 2, 1 + 2 = 3, 2 + 3 = 5, 3 + 5 = 8
示例 2:
输入: "199100199"输出: true
解释: 累加序列为: 1, 99, 100, 199。1 + 99 = 100, 99 + 100 = 199
进阶:
你如何处理一个溢出的过大的整数输入?



```c++

class Solution {
public:
    bool isAdditiveNumber(string num) {
        int size = num.size();
        if (size <= 2)
            return false;
        string str1, str2, str3;
        int len1, len2;
        for (len1 = 1; len1 <= size / 2; len1++) {
            str1 = num.substr(0, len1);
            for (len2 = 1; len2 <= size / 2; len2++) {
                str2 = num.substr(len1, len2);
                str3 = num.substr(len1 + len2, size - len1 - len2);
                if (DFS(str1, str2, str3))
                    return true;
            }
        }
        return false;
    }
    // 3 种情况：1 相等 返回True; 2. 确定不相等 3 不确定 继续DFS
    bool DFS(string first,string second,string last) {
        string addstr = add(first, second);
        // 1.相等
        if (addstr == last) 
            return true;
        // 2. 确定不相等
        if (first[0] == '0'&&first != "0" || second[0] == '0'&&second != "0") 
            return false;
        if (addstr.size() > last.size()) 
            return false;
        int size = addstr.size();
        if (addstr != last.substr(0, size)) 
            return false;
        //3. 不确定
        first = second;
        second = addstr;
        last = last.substr(size, int(last.size()) - size);
        return DFS(first, second, last);
    }
    string add(string str1, string str2) {
        if (str1.size() < str2.size()) swap(str1, str2);
        int size1 = str1.size();
        int size2 = str2.size();
        str2 = string(size1 - size2, '0') + str2;
        int sgn = 0;
        for (int i = size1; i >= 1; i--) {
            int nums = str1[i - 1] - '0' + str2[i - 1] - '0' + sgn;
            str1[i - 1] = nums % 10 + '0';
            sgn = nums / 10;
        }
        if (sgn == 1) str1 = "1" + str1;
        return str1;
    }
};

```

