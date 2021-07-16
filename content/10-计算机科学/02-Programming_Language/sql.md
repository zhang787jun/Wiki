---
title: "高效Sql"
layout: page
date: 2099-06-02 00:00
---


# 自增
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

查看指定数据库各表容量大小
例：查看mysql库各表容量大小
```sql
select 
table_schema as '数据库',
table_name as '表名',
table_rows as '记录数',
truncate(data_length/1024/1024, 2) as '数据容量(MB)',
truncate(index_length/1024/1024, 2) as '索引容量(MB)'
from information_schema.tables
where table_schema='mysql'
order by data_length desc, index_length desc;
```