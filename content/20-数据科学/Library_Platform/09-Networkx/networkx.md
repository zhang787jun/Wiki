---
title: "networkx--复杂网络分析包"
layout: page
date: 2099-06-02 00:00
---
[TOC]

# 1. 基本操作


## 1.1. 创建图

```python
import networkx as nx

G = nx.Graph() # 创建无向图
G = nx.DiGraph() # 创建有向图
G = nx.MultiGraph() # 创建多重无向图
G = nx.MultiDigraph() # 创建多重有向图
G.clear() #清空图
```


## 添加边/节点

```python
# 创建无向图
G = nx.Graph()
G.add_node(1) # 添加节点１
G.add_edge(2,3) #　添加节点２，３并链接２３节点
G.add_nodes_from([1]) # 添加节点１
G.add_edges_from([2,3]) #　添加节点２，３并链接２３节点

print(G.nodes, G.edges, G.number_of_nodes(), G.number_of_edges())

# 创建有向图
G = nx.DiGraph() 
G.add_edge(2, 3)
G.add_edge(3, 2)
G.to_undirected()  # 转换成无向图
print(G.edges)

# 加权图
G = nx.DiGraph()
G.add_weighted_edges_from([(0,1,3.0), (1,2,7.5)]) # 给０１边加权３，　１２边加权７．５
print(G.get_edge_data(1,2))  # 获得１２边的属性

G.add_weighted_edges_from([(2,3,5)], weight='color')
print(G.edges.data())

G.node[1]['size'] = 10
print(G.nodes.data())
```

## 删除边/节点
```python
F.remove_edge(1,2)
F.remove_edges_from([(11,12), (13,14)])
nx.draw(F, with_labels=True)
plt.show()
```



# 可视化

```python
nx.draw(G, with_labels=True)
plt.show()
```


```python
    load_data = sio.loadmat(load_path)

    #阈值处理
      mat=np.array(load_data['R'])
      mat[mat<0]=0
      mat[mat<0.45]=0

    #写入txt文件
     # np.savetxt(thr_path, mat);

      #计算degree
      g = nx.Graph()
      for i in range(len(mat)):
          for j in range(len(mat)):
              if(mat[i,j]>0):  #删除边的权重小于等于0的边
                g.add_edge(i, j,weight=mat[i,j])

      # nx.draw(g)
      # nx.draw(g,with_labels=True)  # 将标号标出来
      # plt.show()

      # 按权重划分为重权值得边和轻权值的边
      elarge = [(u, v) for (u, v, d) in g.edges(data=True) if d['weight'] > 0.5]
      esmall = [(u, v) for (u, v, d) in g.edges(data=True) if d['weight'] <= 0.5]
      # 节点位置
      pos = nx.spring_layout(g)  # positions for all nodes
      # 首先画出节点位置
      # nodes
      nx.draw_networkx_nodes(g, pos, node_color='b',node_size=300,alpha=0.4)
      # 根据权重，实线为权值大的边，虚线为权值小的边
      # edges
      nx.draw_networkx_edges(g, pos, edgelist=elarge,
                             width=3)
      nx.draw_networkx_edges(g, pos, edgelist=esmall,
                             width=1, alpha=0.5, edge_color='g', style='dashed')

      # labels标签定义
      nx.draw_networkx_labels(g, pos, font_size=13, font_family='sans-serif')

      plt.axis('off')
      plt.savefig("weighted_graph.png")  # save as png
      plt.show()

```
## 其他
```python
import networkx as nx

oo = float('inf')

# 创建无向图
G = nx.Graph()
G.add_node(1) # 添加节点１
G.add_edge(2,3) #　添加节点２，３并链接２３节点
print(G.nodes, G.edges, G.number_of_nodes(), G.number_of_edges())

# 创建有向图
G = nx.DiGraph() 
G.add_edge(2, 3)
G.add_edge(3, 2)
G.to_undirected()  # 转换成无向图
print(G.edges)

# 加权图
G = nx.DiGraph()
G.add_weighted_edges_from([(0,1,3.0), (1,2,7.5)]) # 给０１边加权３，　１２边加权７．５
print(G.get_edge_data(1,2))  # 获得１２边的属性

G.add_weighted_edges_from([(2,3,5)], weight='color')
print(G.edges.data())

G.node[1]['size'] = 10
print(G.nodes.data())


import matplotlib.pyplot as plt

g_data = [(1, 2, 6), (1, 3, 1), (1, 4, 5),
          (2, 3, 5),  (2, 5, 3),
          (3, 4, 5), (3, 5, 6), (3, 6, 4), (4, 6, 2),
          (5, 6, 6)]

# 最小生成树
g = nx.Graph()
g.add_weighted_edges_from(g_data)
tree = nx.minimum_spanning_tree(g, algorithm='prim')
print(tree.edges(data=True))

# 最短路径
G = nx.path_graph(5)  # 0-1-2-3-4链
print(nx.dijkstra_path(G, 0, 4))

# 所有节点之间的最短路径
G = nx.Graph()
G.add_weighted_edges_from(g_data)
gen = nx.all_pairs_shortest_path(G)
print(dict(gen))

# 各点之间可达性
G = nx.Graph()
G.add_weighted_edges_from(g_data)
print(nx.communicability(G))

# 获得图中非连通点的列表
G = nx.Graph()
G.add_edge(1,2)
G.add_node(3)
print(list(nx.isolates(G)))

# 遍历
G = nx.Graph()
G.add_weighted_edges_from(g_data)
d_gen = nx.dfs_edges(G,1)  #  按边深度搜索, 1为起点
b_gen = nx.bfs_edges(G,1)
print(list(d_gen), list(b_gen))
print(nx.dfs_tree(G,1).nodes())  # 按点深搜


from networkx.algorithms.flow import shortest_augmenting_path
import matplotlib.pyplot as plt

G = nx.DiGraph()
G.add_edge('x','a', capacity=3.0)
G.add_edge('x','b', capacity=1.0)
G.add_edge('a','c', capacity=3.0)
G.add_edge('b','c', capacity=5.0)
G.add_edge('b','d', capacity=4.0)
G.add_edge('d','e', capacity=2.0)
G.add_edge('c','y', capacity=2.0)
G.add_edge('e','y', capacity=3.0)

# 将参数画到图上
pos = nx.spring_layout(G)
capacity = nx.get_edge_attributes(G, 'capacity')
# nx.draw_networkx_nodes(G, pos)
# nx.draw_networkx_edges(G, pos)
# nx.draw_networkx_labels(G, pos)
# nx.draw_networkx_edge_labels(G,pos,capacity)

# 最大流
flow_value, flow_dict = nx.maximum_flow(G,'x', 'y', flow_func=shortest_augmenting_path)
print(flow_value, flow_dict)
# plt.show()


# 最小成本流
G = nx.DiGraph()
G.add_node('a', demand = -5)
G.add_node('d', demand = 5)
G.add_edge('a', 'b', weight = 3, capacity = 4)
G.add_edge('a', 'c', weight = 6, capacity = 10)
G.add_edge('b', 'd', weight = 1, capacity = 9)
G.add_edge('c', 'd', weight = 2, capacity = 5)
flow_cost, flow_dict = nx.capacity_scaling(G)
print(flow_cost, flow_dict)

# 欧拉回路  一个无向图G,一条路径经过图G的每一条边,且仅经过一次,这条路径称为欧拉路径．如果起点和终点同一点，则为欧拉回路
# 无向图：每个顶点的度数都是偶数则存在欧拉回路
# 有向图：每个顶点的入度都等于出度则存在欧拉回路
DG = nx.DiGraph({0: [3], 1: [2], 2: [3], 3: [0, 1]})
G = nx.Graph({0: [1,2], 1: [0,2], 2: [0,1,3,4], 3: [2,4], 4:[2,3]})
print(nx.is_eulerian(DG))
print(nx.is_eulerian(G))
print(list(nx.eulerian_circuit(DG)))
print(list(nx.eulerian_circuit(G)))

# 最小点割集
node_cut = nx.minimum_node_cut(G, flow_func=shortest_augmenting_path)
print(node_cut)

# 对于带权无向图边切割，得到最小切割权之和，以及两个分离区域
G = nx.Graph()
G.add_edge('x','a', weight=3)
G.add_edge('x','b', weight=1)
G.add_edge('a','c', weight=3)
G.add_edge('b','c', weight=5)
G.add_edge('b','d', weight=4)
G.add_edge('d','e', weight=2)
G.add_edge('c','y', weight=2)
G.add_edge('e','y', weight=3)

cut_value, partition = nx.stoer_wagner(G)
print(cut_value, partition)

# 最大权重匹配　匈牙利、KM算法
G = nx.Graph()
G.add_weighted_edges_from([('A', 'a', 3), ('A', 'c', 4), ('B', 'a', 2), ('B', 'b', 1), ('B', 'c', 3), ('C', 'c', 5)])
print(nx.max_weight_matching(G))

# 拓扑排序
G = nx.DiGraph()
G.add_edge('x','a', weight=3)
G.add_edge('a','c', weight=3)
G.add_edge('b','c', weight=5)
G.add_edge('b','d', weight=4)
G.add_edge('d','e', weight=2)
G.add_edge('c','y', weight=2)
G.add_edge('e','y', weight=3)
print(list(nx.topological_sort(G)))

# 最小成本最大流
G = nx.DiGraph()
G.add_edge('a', 'b', weight = 3, capacity = 4)
G.add_edge('a', 'c', weight = 6, capacity = 10)
G.add_edge('b', 'd', weight = 1, capacity = 9)
G.add_edge('c', 'd', weight = 2, capacity = 5)
print(nx.max_flow_min_cost(G, 'a', 'd'))


#复杂网络生成
# ER随机图   # 随机生成20个节点，节点间的连接概率都是0.2
# ER = nx.random_graphs.erdos_renyi_graph(20, 0.2)
# pos = nx.shell_layout(ER)
# nx.draw(ER, pos, with_labels=False,edge_color='b', alpha=0.3, node_size=30)
# plt.show()

# WS小世界网络  生成一个含有n个节点、每个节点有k个邻居、以概率p随机化重连边的WS小世界网络。
WS = nx.random_graphs.watts_strogatz_graph(20, 4, 0.3)
pos = nx.circular_layout(WS)
nx.draw(WS, pos, with_labels=False, node_size=30, edge_color='b', alpha=0.3)
plt.show()


# BA无标度网络 生成一个含有n个节点、每次加入m条边的BA无标度网络
# BA = nx.random_graphs.barabasi_albert_graph(10,2)
# pos = nx.spring_layout(BA)
# nx.draw(BA, pos, with_labels=False, node_size=30, edge_color='b', alpha=0.3)
# plt.show()

# 扩展ＢＡ无标度网络  节点数，添加新边数，两点间添加边的概率，边重连的概率
# ExBA = nx.random_graphs.extended_barabasi_albert_graph(200, 4, 0.4, 0.2)
# pos = nx.spring_layout(ExBA)
# nx.draw(ExBA, pos, with_labels=False, node_size=30, edge_color='b', alpha=0.3)
# plt.show()

```