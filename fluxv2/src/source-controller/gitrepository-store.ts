import {Common, Renderer} from "@k8slens/extensions";
import {GitRepository} from "./gitrepository";
import { observable, makeObservable } from "mobx";

export class GitRepositoryApi extends Renderer.K8sApi.KubeApi<GitRepository> {
}

export const gitRepositoryApi = new GitRepositoryApi({
    objectConstructor: GitRepository
});

export class GitRepositoryStore extends Renderer.K8sApi.KubeObjectStore<GitRepository> {
    api = gitRepositoryApi
}

export const gitRepositoryStore = new GitRepositoryStore();

Renderer.K8sApi.apiManager.registerStore(gitRepositoryStore);

