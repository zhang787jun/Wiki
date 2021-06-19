---
title: "Pytorch Geometric 自带数据集"
layout: page
date: 2099-06-02 00:00
---
[TOC]


`TORCH_GEOMETRIC.DATASETS` 包含的了常见的图数据集
数据集|说明
--|--
GNNBenchmarkDataset|A variety of artificially and semi-artificially generated graph datasets from the “Benchmarking Graph Neural Networks” paper.

Planetoid


CitationFull

The full citation network datasets from the “Deep Gaussian Embedding of Graphs: Unsupervised Inductive Learning via Ranking” paper.

CoraFull

Alias for torch_geometric.dataset.CitationFull with name="cora".

Coauthor

The Coauthor CS and Coauthor Physics networks from the “Pitfalls of Graph Neural Network Evaluation” paper.

Amazon

The Amazon Computers and Amazon Photo networks from the “Pitfalls of Graph Neural Network Evaluation” paper.

PPI

The protein-protein interaction networks from the “Predicting Multicellular Function through Multi-layer Tissue Networks” paper, containing positional gene sets, motif gene sets and immunological signatures as features (50 in total) and gene ontology sets as labels (121 in total).

Reddit

The Reddit dataset from the “Inductive Representation Learning on Large Graphs” paper, containing Reddit posts belonging to different communities.

Reddit2

The Reddit dataset from the “GraphSAINT: Graph Sampling Based Inductive Learning Method” paper, containing Reddit posts belonging to different communities.

Flickr

The Flickr dataset from the “GraphSAINT: Graph Sampling Based Inductive Learning Method” paper, containing descriptions and common properties of images.

Yelp

The Yelp dataset from the “GraphSAINT: Graph Sampling Based Inductive Learning Method” paper, containing customer reviewers and their friendship.

QM7b

The QM7b dataset from the “MoleculeNet: A Benchmark for Molecular Machine Learning” paper, consisting of 7,211 molecules with 14 regression targets.

QM9

The QM9 dataset from the “MoleculeNet: A Benchmark for Molecular Machine Learning” paper, consisting of about 130,000 molecules with 19 regression targets.

ZINC

The ZINC dataset from the ZINC database and the “Automatic Chemical Design Using a Data-Driven Continuous Representation of Molecules” paper, containing about 250,000 molecular graphs with up to 38 heavy atoms.

MoleculeNet

The MoleculeNet benchmark collection from the “MoleculeNet: A Benchmark for Molecular Machine Learning” paper, containing datasets from physical chemistry, biophysics and physiology.

Entities

The relational entities networks “AIFB”, “MUTAG”, “BGS” and “AM” from the “Modeling Relational Data with Graph Convolutional Networks” paper.

GEDDataset

The GED datasets from the “Graph Edit Distance Computation via Graph Neural Networks” paper.

MNISTSuperpixels

MNIST superpixels dataset from the “Geometric Deep Learning on Graphs and Manifolds Using Mixture Model CNNs” paper, containing 70,000 graphs with 75 nodes each.

FAUST

The FAUST humans dataset from the “FAUST: Dataset and Evaluation for 3D Mesh Registration” paper, containing 100 watertight meshes representing 10 different poses for 10 different subjects.

DynamicFAUST

The dynamic FAUST humans dataset from the “Dynamic FAUST: Registering Human Bodies in Motion” paper.

ShapeNet

The ShapeNet part level segmentation dataset from the “A Scalable Active Framework for Region Annotation in 3D Shape Collections” paper, containing about 17,000 3D shape point clouds from 16 shape categories.

ModelNet

The ModelNet10/40 datasets from the “3D ShapeNets: A Deep Representation for Volumetric Shapes” paper, containing CAD models of 10 and 40 categories, respectively.

CoMA

The CoMA 3D faces dataset from the “Generating 3D faces using Convolutional Mesh Autoencoders” paper, containing 20,466 meshes of extreme expressions captured over 12 different subjects.

SHREC2016

The SHREC 2016 partial matching dataset from the “SHREC’16: Partial Matching of Deformable Shapes” paper.

TOSCA

The TOSCA dataset from the “Numerical Geometry of Non-Ridig Shapes” book, containing 80 meshes.

PCPNetDataset

The PCPNet dataset from the “PCPNet: Learning Local Shape Properties from Raw Point Clouds” paper, consisting of 30 shapes, each given as a point cloud, densely sampled with 100k points.

S3DIS

The (pre-processed) Stanford Large-Scale 3D Indoor Spaces dataset from the “3D Semantic Parsing of Large-Scale Indoor Spaces” paper, containing point clouds of six large-scale indoor parts in three buildings with 12 semantic elements (and one clutter class).

GeometricShapes

Synthetic dataset of various geometric shapes like cubes, spheres or pyramids.

BitcoinOTC

The Bitcoin-OTC dataset from the “EvolveGCN: Evolving Graph Convolutional Networks for Dynamic Graphs” paper, consisting of 138 who-trusts-whom networks of sequential time steps.

ICEWS18

The Integrated Crisis Early Warning System (ICEWS) dataset used in the, e.g., “Recurrent Event Network for Reasoning over Temporal Knowledge Graphs” paper, consisting of events collected from 1/1/2018 to 10/31/2018 (24 hours time granularity).

GDELT

The Global Database of Events, Language, and Tone (GDELT) dataset used in the, e.g., “Recurrent Event Network for Reasoning over Temporal Knowledge Graphs” paper, consisting of events collected from 1/1/2018 to 1/31/2018 (15 minutes time granularity).

DBP15K

The DBP15K dataset from the “Cross-lingual Entity Alignment via Joint Attribute-Preserving Embedding” paper, where Chinese, Japanese and French versions of DBpedia were linked to its English version.

WILLOWObjectClass

The WILLOW-ObjectClass dataset from the “Learning Graphs to Match” paper, containing 10 equal keypoints of at least 40 images in each category.

PascalVOCKeypoints

The Pascal VOC 2011 dataset with Berkely annotations of keypoints from the “Poselets: Body Part Detectors Trained Using 3D Human Pose Annotations” paper, containing 0 to 23 keypoints per example over 20 categories.

PascalPF

The Pascal-PF dataset from the “Proposal Flow” paper, containing 4 to 16 keypoints per example over 20 categories.

SNAPDataset

A variety of graph datasets collected from SNAP at Stanford University.

SuiteSparseMatrixCollection

A suite of sparse matrix benchmarks known as the Suite Sparse Matrix Collection collected from a wide range of applications.

TrackMLParticleTrackingDataset

The TrackML Particle Tracking Challenge dataset to reconstruct particle tracks from 3D points left in the silicon detectors.

AMiner

The heterogeneous AMiner dataset from the “metapath2vec: Scalable Representation Learning for Heterogeneous Networks” paper, consisting of nodes from type "paper", "author" and "venue".

WordNet18

The WordNet18 dataset from the “Translating Embeddings for Modeling Multi-Relational Data” paper, containing 40,943 entities, 18 relations and 151,442 fact triplets, e.g., furniture includes bed.

WordNet18RR

The WordNet18RR dataset from the “Convolutional 2D Knowledge Graph Embeddings” paper, containing 40,943 entities, 11 relations and 93,003 fact triplets.

WikiCS

The semi-supervised Wikipedia-based dataset from the “Wiki-CS: A Wikipedia-Based Benchmark for Graph Neural Networks” paper, containing 11,701 nodes, 216,123 edges, 10 classes and 20 different training splits.

WebKB

The WebKB datasets used in the “Geom-GCN: Geometric Graph Convolutional Networks” paper.

WikipediaNetwork

The Wikipedia networks used in the “Geom-GCN: Geometric Graph Convolutional Networks” paper.

Actor

The actor-only induced subgraph of the film-director-actor-writer network used in the “Geom-GCN: Geometric Graph Convolutional Networks” paper.

JODIEDataset

MixHopSyntheticDataset

The MixHop synthetic dataset from the “MixHop: Higher-Order Graph Convolutional Architectures via Sparsified Neighborhood Mixing” paper, containing 10 graphs, each with varying degree of homophily (ranging from 0.0 to 0.9).

# 1. KarateClub 

数据挖掘、社会网络分析常用的一个数据集，美国空手道俱乐部，用于验证社区挖掘算法有效性的常用数据集之一。

Zachary’s karate club（空手道俱乐部） network from the “An Information Flow Model for Conflict and Fission in Small Groups” paper, containing **34 nodes**, connected by **154 (undirected and unweighted) edges**.（无向图、无权重）
# 2. TUDataset

TUDataset：包括58个基础的分类数据集集合，数据都为无向图，如“IMDB-BINARY”，“PROTEINS”等，来源于TU Dortmund University


A variety of graph kernel benchmark datasets, .e.g. “IMDB-BINARY”, “REDDIT-BINARY” or “PROTEINS”, collected from the TU Dortmund University.包括58个基础的分类数据集集合，数据都为无向图
# 3. Planetoid
Planetoid：引文网络数据集，包括“Cora”, “CiteSeer” and “PubMed”，数据都为无向图，来源于论文Revisiting Semi-Supervised Learning with Graph Embeddings，节点代表文档，边代表引用关系

The citation network datasets “Cora”, “CiteSeer” and “PubMed” from the “Revisiting Semi-Supervised Learning with Graph Embeddings” paper.


# 4. CoraFull
完整的“Cora”引文网络数据集，**数据为无向图**，来源于论文Deep Gaussian Embedding of Graphs: Unsupervised Inductive Learning via Ranking，节点代表文档，边代表引用关系
# 5. Coauthor
共同作者网络数据集，包括“CS”和“Physics”，数据都为无向图，来源于论文Pitfalls of Graph Neural Network Evaluation。节点代表作者，若是共同作者则被边相连。学习任务是将作者映射到各自的研究领域中
# 6. Amazon
亚马逊网络数据集，包括“Computers”和“Photo”，数据都为无向图，来源于论文Pitfalls of Graph Neural Network Evaluation。节点代表货物，边代表两种货物经常被同时购买。学习任务是将货物映射到各自的种类里
# 7. PPI
蛋白质-蛋白质反应网络，数据为无向图，来源于论文Predicting multicellular function through multilayer tissue networks
# 8. Entities
关系实体网络，包括“AIFB”, “MUTAG”, “BGS” 和“AM”，数据都为无向图，来源于论文Modeling Relational Data with Graph Convolutional Networks
# 9. BitcoinOTC
数据为有向图，包括138个“who-trusts-whom”网络，来源于论文EvolveGCN: Evolving Graph Convolutional Networks for Dynamic Graphs

# 10. Cora
### 10.0.1. 参考链接

+ [数据集下载链接](https://linqs.soe.ucsc.edu/data)

### 10.0.2. 数据集介绍

Cora数据集由许多机器学习领域的paper构成，这些paper被分为7个类别：

+ Case_Based
+ Genetic_Algorithms
+ Neural_Networks
+ Probabilistic_Methods
+ Reinforcement_Learning
+ Rule_Learning
+ Theory

在该数据集中，每一篇论文至少引用了该数据集里面另外一篇论文或者被另外一篇论文所引用，数据集总共有2708篇papers。

在消除停词以及除去文档频率小于10的词汇，最终词汇表中有1433个词汇。

数据集文件夹中包含两个文件：

1. `.content`文件包含对paper的内容描述，格式为
   $$
   \text{<paper_id>  <word_attributes> <class_label>}
   $$
   其中

   + `<paper_id>`是paper的标识符，每一篇paper对应一个标识符。
   + `<word_attributes>`是词汇特征，为0或1，表示对应词汇是否存在。
   + `<class_label>`是该文档所述的类别。

2. `.cites`文件包含数据集的引用图(citation graph)，每一行格式如下
   $$
   \text{<ID of cited paper> <ID of citing paper>}
   $$
   其中

   + `<ID of cited paper>`是被引用的paper标识符。
   + `<ID of citing paper>`是引用的paper标识符。

   引用的方向是从右向左的，比如有一行为`paper1 paper2`，那么对应的连接关系是`paper2->paper1`。