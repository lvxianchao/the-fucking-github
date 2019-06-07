<template>
    <el-tooltip effect="dark" placement="top" :content="isStarred ? 'Unstar': 'Star'">
        <i class="fa" :class="isStarred ? 'fa-star': 'fa-star-o'" @click="star"></i>
    </el-tooltip>
</template>

<script>
    import axios from 'axios';

    export default {
        name: "Star",
        props: ['repository'],
        data() {
            return {
                isStarred: true,
            }
        },
        watch: {
            'repository.repo.id'(n) {
                let starredRepositoryIds = db.get('repositories').map('repo.id').value();

                this.isStarred = _.includes(starredRepositoryIds, n);
            }
        },
        methods: {
            star() {
                let owner = this.repository.repo.owner.login;
                let repo = this.repository.repo.name;
                let api = `https://api.github.com/user/starred/${owner}/${repo}`;
                let token = db.get('token').value();
                let options = {
                    headers: {
                        Authorization: `token ${token}`,
                    },
                };
                let message = {
                    type: 'error',
                    showClose: true,
                    dangerouslyUseHTMLString: true,
                    duration: 0,
                    message: 'An error has occurred, please check if the Github Access Token authorizes the repo scope. <a target="_blank" href="https://github.com/lvxianchao/the-fucking-github#usage">See here</a>',
                };

                if (this.isStarred) {
                    axios.delete(api, options).then(response => {
                        if (response.status === 204) {
                            this.$message.success('Unstarred success.');

                            let repositories = db.get('repositories').value();
                            _.remove(repositories, repository => {
                                return repository.repo.id === this.repository.repo.id;
                            });

                            db.set('repositories', repositories).write();

                            this.isStarred = !this.isStarred;
                        }
                    }).catch(error => {
                        // 如果响应 404 应该是 TOKEN 没有 REPO 权限造成的
                        if (error.response.status === 404) {
                            this.$message(message);
                        }
                    });
                } else {
                    options.headers['Content-Length'] = 0;
                    axios.put(api, [], options).then(response => {
                        if (response.status === 204) {
                            this.$message.success('Starred success.');

                            let obj = this.repository;
                            Object.assign(obj, {starred_at: ''});
                            db.get('repositories').push(obj).write();

                            this.isStarred = !this.isStarred;
                        }
                    }).catch(error => {
                        // 如果响应 404 应该是 TOKEN 没有 REPO 权限造成的
                        if (error.response.status === 404) {
                            this.$message(message);
                        }
                    });
                }
            }
        }
    }
</script>

<style scoped>
    i {
        margin-right: 15px;
        cursor: pointer;
    }
</style>