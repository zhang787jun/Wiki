---
title: "高效Sql"
layout: page
date: 2099-06-02 00:00
---
# 自己

```sql
# 自增id
If it is MySql you can try

SELECT @n := @n + 1 n,
       first_name, 
       last_name
  FROM table1, (SELECT @n := 0) m
 ORDER BY first_name, last_name
SQLFiddle

And for SQLServer

SELECT row_number() OVER (ORDER BY first_name, last_name) n,
       first_name, 
       last_name 
  FROM table1 
SQLFiddle
```