---
title: "1. Collaborative Filtering协同过滤"
layout: page
date: 2099-06-02 00:00
---
[TOC]




# 1. OverView


Collaborative Filtering 协同过滤

>Collaborative filtering is a key concept in recommendation.

We start the journey with the important concept in recommender systems—collaborative filtering (CF), which was first coined by the Tapestry system [Goldberg et al., 1992], referring to “people collaborate to help one another perform the filtering process in order to handle the large amounts of email and messages posted to newsgroups”. This term has been enriched with more senses. In a broad sense, it is the process of filtering for information or patterns using techniques involving collaboration among multiple users, agents, and data sources. CF has many forms and numerous CF methods proposed since its advent.

**缺点**
In general, CF only uses the user-item interaction data to make predictions and recommendations. 

协同过滤只是基于用户-商品之间的**交互数据**进行预测和推荐，而忽略了用户、商品的自身上下文信息（坐标属性）。


推荐系统的头部效应较明显，处理稀疏向量的能力弱 => MF用更稠密的隐向量表示用户和物品
无法引入场景信息和更精细的用户/物品信息 => LR模型、机器学习模型


On the other hand, collaborative filtering model (discussion is limited to matrix factorisation approach in this notebook) computes the latent factors of the users and items. 

# 2. Categorizetion
Overall, CF techniques can be categorized into: 
1. memory-based CF 
2. model-based CF
3. their hybrid 


[Su & Khoshgoftaar, 2009]. 
## 2.1. Memory-based CF
**为什么叫Memory-based？**

We have seen that memory-based CF methods infer ratings based on the **memory of previous user-item interaction** records.

基于历史的用户-商品交互信息的记忆

基于邻域方法(Neighborhood/Similarity Based Models)的假设：**近朱者赤近墨者黑**



Representative memory-based CF techniques are nearest neighbor-based CF such as user-based CF and item-based CF [Sarwar et al., 2001]. 
### 2.1.1. user-based CF (1994)

**用户相似度计算**：余弦相似度/皮尔逊相关系数/引入物品平均分
**最终结果的排序**：按相似度加权
**特点**：社交特性更强
缺点：
用户太多，在线存储系统存不下矩阵。
不适用于正反馈获取困难的应用场景（酒店预定、大件商品购买），用户历史数据向量稀疏


### 2.1.2. item-based CF

UserCF 适合用在个性化需求不强，热点很明显的领域，比如新闻，电影推荐
ItemCF 适合用在个性化需求比较强，长尾比较长的领域，比如书，电商的推荐


## 2.2. Model-based  CF 
**什么叫Model-based  CF **
.Model-based CF methods are similar in that they make guesses based on previous interaction records. However, instead of relying on pre-computed similarity (or distance) measures, model-based methods employ various prediction models to capture the latent relationship between users and items.


Model-based 协同过滤也是基于用户-商品的历史交互记录，然而Model-based CF 使用**多种模型**来捕捉用户-商品之间的隐含特征，而不是仅仅依赖预先设定的距离。

也叫基于学习的方法，通过定义一个参数模型来描述用户和物品、用户和用户、物品和物品之间的关系，然后通过已有的用户-物品评分矩阵来优化求解得到参数。例如矩阵分解、隐语义模型LFM等.

### 2.2.1. Baseline predictor
In fact, we have already implemented a very simple algorithm for model-based CF, which is the baseline predictor. In general, most recommendation problems show inherent biases, which are overall tendencies that can be generalized on a dataset-level. For instance, some users are generous that they give better ratings than others on average. At the same time, some items have inherently more appealing features than others, resulting in better ratings on average. If you look at the top-100 movies in IMDb, they are rated higher than other movies among the vast majority of users.

Therefore, the baseline estimator tries to guess the magnitude of individual user and item biases. The equation for the estimator is:

$$b_{ui}=ave+b_u+b_i$$
- $ave$ is the average rating across** all user-item interactions (所有使用平均数)
- $b_u$,$b_i$refer to biases for user  and item ,respectively. 

Hence, the baseline predictor tries to quantify how the user and item of interest deviate from the overall average. This is a simple, yet very powerful, idea. 

In the previous posting, we have seen that it is difficult to beat the baseline predictor with k-NN without incorporating it.

### 2.2.2.  Latent Factor Model(隐语义模型)
在隐语义模型中，我们使用同样的维度来表征(Embedding)条目和用户。对于条目，这个表征就是条目表现出的对应维度的特征强度；对于用户，就是用户表现出的对对应维度特征的偏好强度。这样，我们让用户的表征向量乘以条目的表征向量(数量积)

Latent factor models such as matrix factorization are examples of model-based CF. Memory-based CF has limitations in dealing with sparse and large-scale data since it computes the similarity values based on common items. 

Model-based methods become more popular with its better capability in dealing with sparsity and scalability. 
> 解决稀疏与稳定性的问题


Many model-based CF approaches can be extended with **neural networks**, leading to more flexible and scalable models with the computation acceleration in deep learning [Zhang et al., 2019].




#### 2.2.2.1. Matrix factorization algorithm 
Matrix factorization algorithm 矩阵分解
用户和物品的隐向量通过分解协同过滤生成的共现矩阵得到
矩阵分解的方法：特征值分解（方阵，不适用）；SVD（计算量大、要求稠密）；梯度下降法

**优点**
矩阵分解可加入偏差向量
泛化能力强
空间复杂度低
更好的扩展性和灵活性
**缺点**
同样不方便加入场景信息和更精细的用户/物品信息



##### 2.2.2.1.1. 特征值分解
（方阵，不适用）
##### 2.2.2.1.2. The SVD model


The SVD model algorithm is very similar to the ALS algorithm .The two differences between the two approaches are:

- SVD additionally models the user and item biases (also called baselines in the litterature) from users and items.
- The optimization technique in ALS is Alternating Least Squares (hence the name), while SVD uses stochastic gradient descent.


In ALS, the ratings are modeled as follows:

$$\hat r_{u,i} = q_{i}^{T}p_{u}$$

SVD introduces two new scalar variables: the user biases $b_u$ and the item biases $b_i$. The user biases are supposed to capture the tendency of some users to rate items higher (or lower) than the average. The same goes for items: some items are usually rated higher than some others. The model is SVD is then as follows:

$$\hat r_{u,i} = \mu + b_u + b_i + q_{i}^{T}p_{u}$$

Where $\mu$ is the global average of all the ratings in the dataset. The regularised optimization problem naturally becomes:

$$ \sum(r_{u,i} - (\mu + b_u + b_i + q_{i}^{T}p_{u}))^2 +     \lambda(b_i^2 + b_u^2 + ||q_i||^2 + ||p_u||^2)$$

where $\lambda$ is a the regularization parameter.
![](https://miro.medium.com/max/875/0*byI0QOv2JeoTU95K)

##### 2.2.2.1.3. Stochastic Gradient Descent

Stochastic Gradient Descent (SGD) is a very common algorithm for optimization where the parameters (here the biases and the factor vectors) are iteratively incremented with the negative gradients w.r.t the optimization function. The algorithm essentially performs the following steps for a given number of iterations:


$$b_u \leftarrow b_u + \gamma (e_{ui} - \lambda b_u)$$
$$b_i \leftarrow b_i + \gamma (e_{ui} - \lambda b_i)$$  
$$p_u \leftarrow p_u + \gamma (e_{ui} \cdot q_i - \lambda p_u)$$
$$q_i \leftarrow q_i + \gamma (e_{ui} \cdot p_u - \lambda q_i)$$

where $\gamma$ is the learning rate and $e_{ui} =  r_{ui} - \hat r_{u,i} = r_{u,i} - (\mu + b_u + b_i + q_{i}^{T}p_{u})$ is the error made by the model for the pair $(u, i)$.





用户和物品的隐向量通过分解协同过滤生成的共现矩阵得到
矩阵分解的方法：特征值分解（方阵，不适用）；SVD（计算量大、要求稠密）；梯度下降法
矩阵分解可加入偏差向量
优点：
泛化能力强
空间复杂度低
更好的扩展性和灵活性
缺点
同样不方便加入场景信息和更精细的用户/物品信息


##### 2.2.2.1.4. Alternating Least Square (ALS)

Owing to the term of $q_{i}^{T}p_{u}$ the loss function is non-convex. Gradient descent method can be applied but this will incur expensive computations. An Alternating Least Square (ALS) algorithm was therefore developed to overcome this issue. 

The basic idea of ALS is to learn one of $q$ and $p$ at a time for optimization while keeping the other as constant. This makes the objective at each iteration convex and solvable. The alternating between $q$ and $p$ stops when there is convergence to the optimal. It is worth noting that this iterative computation can be parallelised and/or distributed, which makes the algorithm desirable for use cases where the dataset is large and thus the user-item rating matrix is super sparse (as is typical in recommendation scenarios). A comprehensive discussion of ALS and its distributed computation can be found [here](http://stanford.edu/~rezab/classes/cme323/S15/notes/lec14.pdf).


##### 2.2.2.1.5. Bayesian Personalized Ranking

BPR即Bayesian Personalized Ranking，中文名称为贝叶斯个性化排序，是当下推荐系统中常用的一种推荐算法。与其他的基于用户评分矩阵的方法不同的是BPR主要采用用户的隐式反馈（如点击、收藏等），通过对问题进行贝叶斯分析得到的最大后验概率来对item进行排序，进而产生推荐。

### 2.2.3. SAR algorithm

SAR Single Node on MovieLens (Python, CPU)

In this example, we will walk through each step of the Simple Algorithm for Recommendation (SAR) algorithm using a Python single-node implementation.

SAR is a fast, scalable, adaptive algorithm for personalized recommendations based on user transaction history. It is powered by understanding the similarity between items, and recommending similar items to those a user has an existing affinity for.

The following figure presents a high-level architecture of SAR. 

At a very high level, two intermediate matrices are created and used to generate a set of recommendation scores:

- An item similarity matrix $S$ estimates item-item relationships.
- An affinity matrix $A$ estimates user-item relationships.

Recommendation scores are then created by computing the matrix multiplication $A\times S$.

Optional steps (e.g. "time decay" and "remove seen items") are described in the details below.

<img src="https://recodatasets.z20.web.core.windows.net/images/sar_schema.svg?sanitize=true">

### 2.2.4. 1.1 Compute item co-occurrence and item similarity

SAR defines similarity based on item-to-item co-occurrence data. Co-occurrence is defined as the number of times two items appear together for a given user. We can represent the co-occurrence of all items as a $m\times m$ matrix $C$, where $c_{i,j}$ is the number of times item $i$ occurred with item $j$, and $m$ is the total number of items.

The co-occurence matric $C$ has the following properties:

- It is symmetric, so $c_{i,j} = c_{j,i}$
- It is nonnegative: $c_{i,j} \geq 0$
- The occurrences are at least as large as the co-occurrences. I.e., the largest element for each row (and column) is on the main diagonal: $\forall(i,j) C_{i,i},C_{j,j} \geq C_{i,j}$.

Once we have a co-occurrence matrix, an item similarity matrix $S$ can be obtained by rescaling the co-occurrences according to a given metric. Options for the metric include `Jaccard`, `lift`, and `counts` (meaning no rescaling).


If $c_{ii}$ and $c_{jj}$ are the $i$th and $j$th diagonal elements of $C$, the rescaling options are:

- `Jaccard`: $s_{ij}=\frac{c_{ij}}{(c_{ii}+c_{jj}-c_{ij})}$
- `lift`: $s_{ij}=\frac{c_{ij}}{(c_{ii} \times c_{jj})}$
- `counts`: $s_{ij}=c_{ij}$

In general, using `counts` as a similarity metric favours predictability, meaning that the most popular items will be recommended most of the time. `lift` by contrast favours discoverability/serendipity: an item that is less popular overall but highly favoured by a small subset of users is more likely to be recommended. `Jaccard` is a compromise between the two.


### 2.2.5. 1.2 Compute user affinity scores

The affinity matrix in SAR captures the strength of the relationship between each individual user and the items that user has already interacted with. SAR incorporates two factors that can impact users' affinities: 

- It can consider information about the **type** of user-item interaction through differential weighting of different events (e.g. it may weigh events in which a user rated a particular item more heavily than events in which a user viewed the item).
- It can consider information about **when** a user-item event occurred (e.g. it may discount the value of events that take place in the distant past.

Formalizing these factors produces us an expression for user-item affinity:

$$a_{ij}=\sum_k w_k \left(\frac{1}{2}\right)^{\frac{t_0-t_k}{T}} $$

where the affinity $a_{ij}$ for user $i$ and item $j$ is the weighted sum of all $k$ events involving user $i$ and item $j$. $w_k$ represents the weight of a particular event, and the power of 2 term reflects the temporally-discounted event. The $(\frac{1}{2})^n$ scaling factor causes the parameter $T$ to serve as a half-life: events $T$ units before $t_0$ will be given half the weight as those taking place at $t_0$.

Repeating this computation for all $n$ users and $m$ items results in an $n\times m$ matrix $A$. Simplifications of the above expression can be obtained by setting all the weights equal to 1 (effectively ignoring event types), or by setting the half-life parameter $T$ to infinity (ignoring transaction times).

### 2.2.6. 1.3 Remove seen item

Optionally we remove items which have already been seen in the training set, i.e. don't recommend items which have been previously bought by the user again.

### 2.2.7. 1.4 Top-k item calculation

The personalized recommendations for a set of users can then be obtained by multiplying the affinity matrix ($A$) by the similarity matrix ($S$). The result is a recommendation score matrix, where each row corresponds to a user, each column corresponds to an item, and each entry corresponds to a user / item pair. Higher scores correspond to more strongly recommended items.

It is worth noting that the complexity of recommending operation depends on the data size. SAR algorithm itself has $O(n^3)$ complexity. Therefore the single-node implementation is not supposed to handle large dataset in a scalable manner. Whenever one uses the algorithm, it is recommended to run with sufficiently large memory. 
## 2.3. hybrid


In general, CF only uses the user-item interaction data to make predictions and recommendations. Besides CF, content-based and context-based recommender systems are also useful in incorporating the content descriptions of items/users and contextual signals such as timestamps and locations. 

Obviously, we may need to adjust the model types/structures when different input data is available.






