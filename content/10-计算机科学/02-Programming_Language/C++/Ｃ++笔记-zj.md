---
title: "c++笔记"
layout: page
date: 2099-06-02 00:00
---
[TOC]


# C++简介
## 安装C++
### 1. 文本编辑器
### 2. 编译器


#### 关于程序的编译和链接

一般来说，无论是 C、C++、还是pas，首先要把源文件编译成中间代码文件，在Windows下也就是 .obj 文件，UNIX下是 .o 文件，即 Object File，这个动作叫做编译（compile）。然后再把大量的 Object File合成执行文件，这个动作叫作链接（link）。

编译时，编译器需要的是语法的正确，函数与变量的声明的正确。对于后者，通常需要告诉编译器头文件的所在位置（头文件中应该只是声明，而定义应该放在C/C++文件中），只要所有的语法正确，编译器就可以编译出中间目标文件。一般来说，每个源文件应该对应于一个中间目标文件。都如果函数未被声明，编译器会给出一个警告，但可以生成Object File。但在链接程序时，链接器会在所有的 Object File中找寻函数的实现，如果找不到，那到就会报链接错误码（Linker Error）

链接时，主要是链接函数和全局变量，链接器并不管函数所在的源文件，只管函数的中间目标文件，在大多数时候，由于源文件太多，编译生成的中间目标文件太多，而在链接时需要明显地指出中间目标文件名，这对于编译很不方便，所以，我们要给中间目标文件打个包，在Windows下这种包叫“库文件”（Library File)，也就是 .lib 文件，在UNIX下，是Archive File，也就是 .a 文件。

单个源文件生成可执行程序
下面是一个保存在文件 helloworld.cpp 中一个简单的 C++ 程序的代码：
```c++
/* helloworld.cpp */
#include <iostream>
int main(int argc,char *argv[]) {
  std::cout << "hello, world" << std::endl;
  return(0);
}
```
程序使用定义在头文件 iostream 中的 cout，向标准输出写入一个简单的字符串。该代码可用以下命令编译为可执行文件：
```shell
g++ helloworld.cpp
```
编译器 g++ 通过检查命令行中指定的文件的后缀名可识别其为 C++ 源代码文件。编译器默认的动作：编译源代码文件生成对象文件(object file)，链接对象文件和 libstdc++ 库中的函数得到可执行程序, 然后删除对象文件。

由于命令行中未指定可执行程序的文件名，编译器采用默认的 a.out。程序可以这样来运行：

```shell
$ ./a.out
hello, world
```
更普遍的做法是通过 -o 选项指定可执行程序的文件名。下面的命令将产生名为 helloworld 的可执行文件：

```shell
$ g++ helloworld.cpp -o helloworld

```
在命令行中输入程序名可使之运行：

$ ./helloworld
hello, world
程序 g++ 是将 gcc 默认语言设为 C++ 的一个特殊的版本，链接时它自动使用 C++ 标准库而不用 C 标准库。通过遵循源码的命名规范并指定对应库的名字，用 gcc 来编译链接 C++ 程序是可行的，如下例所示：

$ gcc helloworld.cpp -l stdc++ -o helloworld

选项 -l (ell) 通过添加前缀 lib 和后缀 .a 将跟随它的名字变换为库的名字 libstdc++.a。而后它在标准库路径中查找该库。gcc 的编译过程和输出文件与 g++ 是完全相同的。

在大多数系统中，GCC 安装时会安装一名为 c++ 的程序。如果被安装，它和 g++ 是等同，如下例所示，用法也一致：

$ c++ helloworld.cpp -o helloworld

多个源文件生成可执行程序
如果多于一个的源码文件在 g++ 命令中指定，它们都将被编译并被链接成一个单一的可执行文件。下面是一个名为 speak.h 的头文件；它包含一个仅含有一个函数的类的定义：
```c++
/* speak.h */
#include <iostream>
class Speak {
 public:
  void sayHello(const char *);
};
```
下面列出的是文件 speak.cpp 的内容：包含 sayHello() 函数的函数体：
```c++
/* speak.cpp */
#include "speak.h"
void Speak::sayHello(const char *str) {
  std::cout << "Hello " << str << "\n";
}
```
文件 hellospeak.cpp 内是一个使用 Speak 类的程序：
```c++
/* hellospeak.cpp */
#include "speak.h"
int main(int argc,char *argv[])
{
    Speak speak;
    speak.sayHello("world");
    return(0);
}
```
下面这条命令将上述两个源码文件编译链接成一个单一的可执行程序：
```c++
g++ hellospeak.cpp speak.cpp -o hellospeak
```


PS：这里说一下为什么在命令中没有提到 speak.h 这个文件，原因是在 speak.cpp 中包含有 #include"speak.h" 这句代码，它的意思是搜索系统头文件目录之前将先在当前目录中搜索文件 speak.h,而 speak.h 正在该目录中，不用再在命令中指定了。

源文件生成对象文件
选项 -c 用来告诉编译器编译源代码但不要执行链接，输出结果为对象文件。文件默认名与源码文件名相同，只是将其后缀变为 .o。例如，下面的命令将编译源码文件 hellospeak.cpp 并生成对象文件 hellospeak.o：

$ g++ -c hellospeak.cpp

命令 g++ 也能识别 .o 文件并将其作为输入文件传递给链接器。下列命令将编译源码文件为对象文件并将其链接成单一的可执行程序：

$ g++ -c hellospeak.cpp 
$ g++ -c speak.cpp 
$ g++ hellospeak.o speak.o -o hellospeak
选项 -o 不仅仅能用来命名可执行文件。它也用来命名编译器输出的其他文件。例如：除了中间的对象文件有不同的名字外，下列命令生将生成和上面完全相同的可执行文件：

$ g++ -c hellospeak.cpp -o hspk1.o 
$ g++ -c speak.cpp -o hspk2.o 
$ g++ hspk1.o hspk2.o -o hellospeak
编译预处理
选项 -E 使 g++ 将源代码用编译预处理器处理后不再执行其他动作。下面的命令预处理源码文件 helloworld.cpp 并将结果显示在标准输出中：

$ g++ -E helloworld.cpp

本文前面所列出的 helloworld.cpp 的源代码，仅仅有六行，而且该程序除了显示一行文字外什么都不做，但是，预处理后的版本将超过 1200 行。这主要是因为头文件 iostream 被包含进来，而且它又包含了其他的头文件，除此之外，还有若干个处理输入和输出的类的定义。

预处理过的文件的 GCC 后缀为 .ii，它可以通过 -o 选项来生成，例如：

$ gcc -E helloworld.cpp -o helloworld.ii

生成汇编代码
选项 -S 指示编译器将程序编译成汇编语言，输出汇编语言代码而後结束。下面的命令将由 C++ 源码文件生成汇编语言文件 helloworld.s：

$ g++ -S helloworld.cpp

生成的汇编语言依赖于编译器的目标平台。

创建静态库
静态库是编译器生成的一系列对象文件的集合。链接一个程序时用库中的对象文件还是目录中的对象文件都是一样的。库中的成员包括普通函数，类定义，类的对象实例等等。静态库的另一个名字叫归档文件(archive)，管理这种归档文件的工具叫 ar 。

在下面的例子中，我们先创建两个对象模块，然后用其生成静态库。

头文件 say.h 包含函数 sayHello() 的原型和类 Say 的定义：

/* say.h */
#include <iostream>
void sayhello(void);
class Say {
 private:
  char *string;
 public:
  Say(char *str){
    string = str;
  }
  void sayThis(const char *str){
    std::cout << str << " from a static library\n";
  }
  void sayString(void);
};
下面是文件 say.cpp 是我们要加入到静态库中的两个对象文件之一的源码。它包含 Say 类中 sayString() 函数的定义体；类 Say 的一个实例 librarysay 的声明也包含在内：

/* say.cpp */
#include "say.h"
void Say::sayString() {
  std::cout << string << "\n";
}

Say librarysay("Library instance of Say");
源码文件 sayhello.cpp 是我们要加入到静态库中的第二个对象文件的源码。它包含函数 sayhello() 的定义：

/* sayhello.cpp */
#include "say.h"
void sayhello(){
  std::cout << "hello from a static library\n";
}
下面的命令序列将源码文件编译成对象文件，命令 ar 将其存进库中

$ g++ -c sayhello.cpp
$ g++ -c say.cpp
$ ar -r libsay.a sayhello.o say.o
程序 ar 配合参数 -r 创建一个新库 libsay.a 并将命令行中列出的对象文件插入。采用这种方法，如果库不存在的话，参数 -r 将创建一个新的库，而如果库存在的话，将用新的模块替换原来的模块。

下面是主程序 saymain.cpp，它调用库 libsay.a 中的代码：

/* saymain.cpp */
#include "say.h"
int main(int argc, char *argv[]){
  extern Say librarysay; // 使用库的对象
  Say localsay = Say("Local instance of Say"); //使用库的类定义
  sayhello(); // 使用库的普通该函数
  librarysay.sayThis("howdy");
  librarysay.sayString();
  localsay.sayString();
  return(0);
}
该程序可以下面的命令来编译和链接：

$ g++ saymain.cpp libsay.a -o saymain

程序运行时，产生以下输出：

hello from a static library
howdy from a static library
Library instance of Say
Local instance of Say
小结
上面介绍了手动通过命令编译 C++ 源文件，但是面对一些大工程，源码文件数量多且依赖关系复杂时，手动编译不太现实，这时候就要依赖 make 和 Makefile 对程序进行自动编译了，简单来说就是把编译规则写好在 Makefile 里，然后通过 make 进行自动编译，具体细节可参考这个教程 跟我一起写Makefile。

#### Makefile
Makefile 内容参考
https://wiki.ubuntu.org.cn/%E8%B7%9F%E6%88%91%E4%B8%80%E8%B5%B7%E5%86%99Makefile
#### VScode 配置C++编译器
https://www.zhihu.com/question/30315894


## 第一个C++程序
## C++基础
### 1. 数据（变量+）
#### 0. 基本的内置数据类型
C++ 为程序员提供了种类丰富的内置数据类型和用户自定义的数据类型。下表列出了七种基本的 C++ 数据类型：

|     类型 |   关键字 |
| -------: | -------: |
|   布尔型 |     bool |
|   字符型 |     char |
|     整型 |      int |
|   浮点型 |    float |
| 双浮点型 |   double |
|   无类型 | **void** |
| 宽字符型 |  wchar_t |

#### 1. 字符串
1. String 
    char greeting[6] = {'H', 'e', 'l', 'l', 'o', '\0'};
    char greeting[] = "Hello";

2.char 字符

**Methods:**
序号|函数 & 目的
1|strcpy(s1, s2);
复制字符串 s2 到字符串 s1。
2|strcat(s1, s2);
连接字符串 s2 到字符串 s1 的末尾。
3|strlen(s1);
返回字符串 s1 的长度。
4|strcmp(s1, s2);
如果 s1 和 s2 是相同的，则返回 0；如果 s1<s2 则返回值小于 0；如果 s1>s2 则返回值大于 0。
5|strchr(s1, ch);
返回一个指针，指向字符串 s1 中字符 ch 的第一次出现的位置。
6|strstr(s1, s2);
返回一个指针，指向字符串 s1 中字符串 s2 的第一次出现的位置。


#### 2. 数字
定义
short  s :10
int    i :1000
long   l :1000000
float  f :230.47
double d :30949.4

方法

1|double cos(double);
该函数返回弧度角（double 型）的余弦。
2|double sin(double);
该函数返回弧度角（double 型）的正弦。
3|double tan(double);
该函数返回弧度角（double 型）的正切。
4|double log(double);
该函数返回参数的自然对数。
5|double pow(double, double);
假设第一个参数为 x，第二个参数为 y，则该函数返回 x 的 y 次方。
6|double hypot(double, double);
该函数返回两个参数的平方总和的平方根，也就是说，参数为一个直角三角形的两个直角边，函数会返回斜边的长度。
7|double sqrt(double);
该函数返回参数的平方根。
8|int abs(int);
该函数返回整数的绝对值。
9|double fabs(double);
该函数返回任意一个十进制数的绝对值。
10|double floor(double);
该函数返回一个小于或等于传入参数的最大整数。


    #include <iostream>
    #include <cmath>
    using namespace std;
    
    int main ()
    {
    // 数字定义
    short  s = 10;
    int    i = -1000;
    long   l = 100000;
    float  f = 230.47;
    double d = 200.374;
    
    // 数学运算
    cout << "sin(d) :" << sin(d) << endl;
    cout << "abs(i)  :" << abs(i) << endl;
    cout << "floor(d) :" << floor(d) << endl;
    cout << "sqrt(f) :" << sqrt(f) << endl;
    cout << "pow( d, 2) :" << pow(d, 2) << endl;
    
    return 0;
    }


C++ 随机数
在许多情况下，需要生成随机数。关于随机数生成器，有两个相关的函数。一个是 rand()，该函数只返回一个伪随机数。生成随机数之前必须先调用 srand() 函数。

下面是一个关于生成随机数的简单实例。实例中使用了 time() 函数来获取系统时间的秒数，通过调用 rand() 函数来生成随机数：


    #include <iostream>
    #include <ctime>
    #include <cstdlib>
    
    using namespace std;
    
    int main ()
    {
    int i,j;
    
    // 设置种子
    srand( (unsigned)time( NULL ) );
    
    /* 生成 10 个随机数 */
    for( i = 0; i < 10; i++ )
    {
        // 生成实际的随机数
        j= rand();
        cout <<"随机数： " << j << endl;
    }
    
    return 0;
    }


#### 3. 数组、tuple

标准
    type arrayName [ arraySize ];
实例
    double balance[10];

#### 4. 枚举(enumeration)类型

        enum 枚举名{ 
            标识符[=整型常数], 
            标识符[=整型常数], 
        ... 
            标识符[=整型常数]
        } 枚举变量;


#### 附1 ：修饰符
C++ 允许在 char、int 和 double 数据类型前放置修饰符。修饰符用于改变基本类型的含义，所以它更能满足各种情境的需求。
带修饰符的变量的大小会根据编译器和所使用的电脑而有所不同。

|   修饰符 |         解释 |
| -------: | -----------: |
|   signed |   有正负数的 |
| unsigned | 没有正负数的 |
|     long |              |
|    short |              |


|   修饰符 |                                                                                                                                                                       解释 |
| -------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|    const |                                                                                                                             const 类型的对象在程序执行期间不能被修改改变。 |
| volatile | 修饰符 volatile 告诉编译器不需要优化volatile声明的变量，让程序可以直接从内存中读取变量。对于一般的变量编译器会对变量进行优化，将内存中的变量值放在寄存器中以加快读写效率。 |
| restrict |                                                                         由 restrict 修饰的指针是唯一一种访问它所指向的对象的方式。只有 C99 增加了新的类型限定符 restrict。 |


#### 附2：typedef 声明

给int 等type 声明一个别名

    typedef type newname; 
    typedef int feet;
    feet distance;



#### 附3：初始化局部变量和全局变量

当局部变量被定义时，系统不会对其初始化，您必须自行对其初始化。定义全局变量时，系统会自动初始化为下列值：

数据类型	初始化默认值
int	0
char	'\0'
float	0
double	0
pointer	NULL
正确地初始化变量是一个良好的编程习惯，否则有时候程序可能会产生意想不到的结果。

#### 附4: 定义常量

在 C++ 中，有两种简单的定义常量的方式：

使用 #define 预处理器。
使用 const 关键字。


#### 析构 delete

delete 针对 new 动态内存分配
delete[] 针对 new [] 动态数组内存分配

        typedef int array_type[1];

        // create and destroy a int[1]
        array_type *a = new array_type;
        delete [] a;

        // create and destroy an int
        int *b = new int;
        delete b;

        // create and destroy an int[1]
        int *c = new int[1];
        delete[] c;

        // create and destroy an int[1][2]
        int (*d)[2] = new int[1][2];
        delete [] d;

### 2. 计算（执行）
#### 1.顺序执行
语法特点，非解释性语言，不能逐行解释，需要；结尾

##### 0. 输入输出 
输出（cout） C out
cout 是与流插入运算符 << 结合使用的
输入（cin） C in

cin 是与流提取运算符 >> 结合使用的

##### 1. 算术运算符
| 符号 |                             含义 |
| ---: | -------------------------------: |
|    + |                 把两个操作数相加 | A + B 将得到 30  |
|    - | 从第一个操作数中减去第二个操作数 | A - B 将得到 -10 |
|    * |                 把两个操作数相乘 | A * B 将得到 200 |
|    / |                     分子除以分母 | B / A 将得到 2   |
|    % |         取模运算符，整除后的余数 | B % A 将得到 0   |
|   ++ |         自增运算符，整数值增加 1 | A++ 将得到 11    |
|   -- |         自减运算符，整数值减少 1 | A-- 将得到 9     |

##### 2. 关系运算符

| 符号 |                                                           含义 |              例子 |
| ---: | -------------------------------------------------------------: | ----------------: |
|   == |               检查两个操作数的值是否相等，如果相等则条件为真。 | (A == B) 不为真。 |
|   != |             检查两个操作数的值是否相等，如果不相等则条件为真。 |   (A != B) 为真。 |
|    > |       检查左操作数的值是否大于右操作数的值，如果是则条件为真。 |  (A > B) 不为真。 |
|    < |       检查左操作数的值是否小于右操作数的值，如果是则条件为真。 |    (A < B) 为真。 |
|   >= | 检查左操作数的值是否大于或等于右操作数的值，如果是则条件为真。 | (A >= B) 不为真。 |
|   <= | 检查左操作数的值是否小于或等于右操作数的值，如果是则条件为真。 |   (A <= B) 为真。 |

##### 3. 逻辑运算符

| 运算符 |                                                                               描述 |             实例 |
| -----: | ---------------------------------------------------------------------------------: | ---------------: |
|     && |                               称为逻辑与运算符。如果两个操作数都非零，则条件为真。 |  (A && B) 为假。 |
|      ! | 称为逻辑非运算符。用来逆转操作数的逻辑状态。如果条件为真则逻辑非运算符将使其为假。 | !(A && B) 为真。 |


| 称为逻辑或运算符。如果两个操作数中有任意一个非零，则条件为真。 (A || B) 为真。



##### 4. 位运算符（二进制数字）
功能：
使得某些位变为0，而其他位不为0
获取中间某些位置


| 运算符 |                                                                                     描述 |                                                             实例 |
| -----: | ---------------------------------------------------------------------------------------: | ---------------------------------------------------------------: |
|      & |                          如果同时存在于两个操作数中，二进制 AND 运算符复制一位到结果中。 |                                (A & B) 将得到 12，即为 0000 1100 |
|        |                               如果存在于任一操作数中，二进制 OR 运算符复制一位到结果中。 |                                                               (A | B) 将得到 61，即为 0011 1101 |
|      ^ | 如果存在于其中一个操作数中但不同时存在于两个操作数中，二进制异或运算符复制一位到结果中。 |                                (A ^ B) 将得到 49，即为 0011 0001 |
|      ~ |                       二进制补码运算符是一元运算符，具有"翻转"位效果，即0变成1，1变成0。 | (~A ) 将得到 -61，即为 1100 0011，一个有符号二进制数的补码形式。 |
|     << |                               二进制左移运算符。左操作数的值向左移动右操作数指定的位数。 |                                A << 2 将得到 240，即为 1111 0000 |
|     >> |                               二进制右移运算符。左操作数的值向右移动右操作数指定的位数。 |                                 A >> 2 将得到 15，即为 0000 1111 |

#### 5. 引用

定义一个变量的别名 

python 中直接命令 a=b


常引用

        #include <iostream>
        
        using namespace std;
        
        int main ()
        {
        // 声明简单的变量
        int    i;
        double d;
        
        // 声明引用变量
        int&    r = i;
        double& s = d;
        
        i = 5;
        cout << "Value of i : " << i << endl;
        cout << "Value of i reference(r) : " << r  << endl;
        
        d = 11.7;
        cout << "Value of d : " << d << endl;
        cout << "Value of d reference(s) : " << s  << endl;
        
        return 0;
        }

#### 6. New运算符（内存动态分配）

##### 6.1 分配变量
    P=new T

T:type 类型（如：int,float等）
变量 P：指针，且指针类型为T，大小与T相同 为sizeof（T）

##### 6.2 分配数组
    P=new T[N]
T:type 类型（如：int,float等）
变量 P：指针，且指针类型为T，大小为 sizeof（T）*N

记得要用delete 释放内存空间
        delete P
1. delete只正对动态分派内存的执政       
2. delete 对每个动态指针智能执行一次
   
#### 2. 条件判断
##### if /if else
标准规则：

        if(boolean_expression)
        {
        // 如果布尔表达式为真将执行的语句
        }

实例：

        #include <iostream>
        using namespace std;
        
        int main ()
        {
        // 局部变量声明
        int a = 10;
        
        // 使用 if 语句检查布尔条件
        if( a < 20 )
        {
            // 如果条件为真，则输出下面的语句
            cout << "a 小于 20" << endl;
        }
        cout << "a 的值是 " << a << endl;
        
        return 0;
        }
##### swite
标准规则

        switch(expression){
            case constant-expression  :
            statement(s);
            break; // 可选的
            case constant-expression  :
            statement(s);
            break; // 可选的
        
            // 您可以有任意数量的 case 语句
            default : // 可选的
            statement(s);
        }

实例：

        #include <iostream>
        using namespace std;
        
        int main ()
        {
        // 局部变量声明
        char grade = 'D';
        
        switch(grade)
        {
        case 'A' :
            cout << "很棒！" << endl; 
            break;
        case 'B' :
        case 'C' :
            cout << "做得好" << endl;
            break;
        case 'D' :
            cout << "您通过了" << endl;
            break;
        case 'F' :
            cout << "最好再试一下" << endl;
            break;
        default :
            cout << "无效的成绩" << endl;
        }
        cout << "您的成绩是 " << grade << endl;
        
        return 0;
        }
#### 3. 循环
##### for

        for ( init; condition; increment )
        {
        statement(s);
        }

        #include <iostream>
        using namespace std;
        
        int main ()
        {
        // for 循环执行
        for( int a = 10; a < 20; a = a + 1 )
        {
            cout << "a 的值：" << a << endl;
        }
        
        return 0;
        }

#### while
先判断后循环
        while(condition)
        {
        statement(s);
        }


#### do while 
先做后判断循环
    do
    {
    statement(s);

    }while( condition );


    #include <iostream>
    using namespace std;
    
    // main() 是程序开始执行的地方
    
    int main()
    {
    cout << "Hello World"; // 输出 Hello World
    return 0;
    }

C++ 语言定义了一些头文件，这些头文件包含了程序中必需的或有用的信息。上面这段程序中，包含了头文件 <iostream>。
下一行 using namespace std; 告诉编译器使用 std 命名空间。**命名空间是 C++ 中一个相对新的概念。**
下一行 // main() 是程序开始执行的地方 是一个单行注释。单行注释以 // 开头，在行末结束。
下一行 int main() 是主函数，程序从这里开始执行。
下一行 cout << "Hello World"; 会在屏幕上显示消息 "Hello World"。
下一行 return 0; 终止 main( )函数，并向调用进程返回值 0。


argc: argument count
argv: argument vector 

块{
}

## 3. 指针问题

指针-->在内存中的地址
指针变量-->保存某一变量/函数/类 在内存中的地址的变量

### 变量指针
### 函数指针
函数也占用内存空间啊 
函数内存空间的起始位置指向称为 函数指针
定义：

        函数返回值的类型（指针）（函数变量1类型，函数变量2类型，···）
其中指针为 * 函数名

        int hello_one(int b) 
        {
            int a;
            a=10;
            return a+b;

        }

        int(*hello_one)(int)


### 类指针

定义类指针基本格式是：Student *b = new Student()；在定义*b的时候并没有分配内存，只有执行new后才会分配内存，且为内存堆。

##  面向对象编程 OOP


在 C++ 里，不用 new 创建的对象会保存在栈里，使用 new 创建时则会在堆里。它们必须分别使用析构函数或者delete操作才能被删除。



        Student a; 
        s.setName("A");
        
        //Studeng *b = new Student();
        Student *b;
        b = new Student();
        b->setName("B");


访问对象实例


对象实例的内存空间大小，对象实例所有变量的大小之和
每个对象都有自己独立的存储空间

1. ClassA.parameter1
2. *Pointer_of_ClassA->parameter1

类 添加函数/参数

函数返回值类型 类:: 函数名{

}

其实就是  使用  类:: 函数名 代替原来的  函数名