---
title: "部署Azure file"
layout: page
date: 2099-06-02 00:00
---

[TOC]

# 安装
How to Use it?

## 安装cifs-utils 
Install cifs-utils on the Kubernetes host. For example, on Fedora based Linux

```shell
# yum -y install cifs-utils
```
Note, as explained in Azure File Storage for Linux, the Linux hosts and the file share must be in the same Azure region.

## Create a storage access secret
Obtain an Microsoft Azure storage account and extract the storage account name (which you provided) and one of the storage account keys. You will then need to create a Kubernetes secret which holds both the account name and key. You can use kubectl directly to create the secret:

```shell
kubectl create secret generic azure-secret --from-literal=azurestorageaccountname=edgestore --from-literal=azurestorageaccountkey=iDqv2of9CxifCnwUBBnpG97znY0QIi6Mmwlmp2TjjGJI2y0n+Fwlx++hWGHJyR1pzA4kDOzMEgq2QOum3Y6KNg==



kubectl create secret generic azure-secret --from-literal=azurestorageaccountname=<...> --from-literal=azurestorageaccountkey=<...>
```
Alternatively, you can create a secret that contains the base64 encoded Azure Storage account name and key. In the secret file, base64-encode Azure Storage account name and pair it with name azurestorageaccountname, and base64-encode Azure Storage access key and pair it with name azurestorageaccountkey. The advantage of this is that you can kubectl apply -f the secret file, whereas you need to delete a secret before you can create a new one using kubectl create secret.

Based on the storage account name, and using the az command line, you can also extract the storage account key using the following command line, given that you are logged in using az login with a service principal which has access to the service account:
```shell

# export STORAGE_ACCOUNT_KEY=$(az storage account keys list -n <storage account name> -g <resource group> --query='[0].value' | tr -d '"')
```
Pod creation
Then create a Pod using the volume spec based on azure.

In the pod, you need to provide the following information:

secretName: the name of the secret that contains both Azure storage account name and key.
shareName: The share name to be used.
readOnly: Whether the filesystem is used as readOnly.
Create the secret:

```shell
    # kubectl create -f examples/volumes/azure_file/secret/azure-secret.yaml
```
You should see the account name and key from kubectl get secret

Mount volume directly in Pod
Then create the Pod:

    # kubectl create -f examples/volumes/azure_file/azure.yaml
Mount volume via pv and pvc
The same mechanism can also be used to mount the Azure File Storage using a Persistent Volume and a Persistent Volume Claim:

Persistent Volume using azureFile
Persistent Volume Claim matching the Volume
Correspondingly, you then mount the volume inside pods using the normal persistentVolumeClaim reference. This mechanism is used in the sample pod YAML azure-2.yaml.



```shell
cat << EOF >azure.yaml
apiVersion: v1
kind: Pod
metadata:
 name: azure
spec:
 containers:
  - image: kubernetes/pause
    name: azure
    volumeMounts:
      - name: azure
        mountPath: /mnt/azure
 volumes:
      - name: azure
        azureFile:
          secretName: azure-secret
          shareName: k8stest
          readOnly: false
EOF
kubectl create -f azure.yaml
```
Analytics


```shell
cat << EOF >pv.yml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: fileshare-pv
  labels:
    usage: fileshare-pv
spec:
  storageClassName: azurefile-sc
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteMany
  persistentVolumeReclaimPolicy: Retain
  azureFile:
    secretName: azure-storage-secret
    shareName: k8s-files
    readOnly: false
EOF
kubectl create -f pv.yml
# kubectl delete -f pv.yml
```




```shell
cat << EOF >pvc.yml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: my-fileshare-pvc
spec:
  storageClassName: azurefile-sc
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 10Gi
EOF
kubectl create -f pvc.yml
```

```shell

cat << EOF >azure.yml
apiVersion: v1
kind: Pod
metadata:
 name: azure
spec:
 containers:
  - image: kubernetes/pause
    name: azure
    volumeMounts:
      - name: azure
        mountPath: /mnt/azure
 volumes:
      - name: azure
        azureFile:
          secretName: azure-storage-secret
          shareName: k8stest
          readOnly: false
EOF
kubectl create -f azure.yml
```

# 参考资料

https://github.com/kubernetes/examples/tree/master/staging/volumes/azure_file