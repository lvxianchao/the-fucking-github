<template>
    <el-tooltip effect="dark" placement="top" :content="isStarred ? 'Unstar': 'Star'">
        <i class="fa" :class="isStarred ? 'fa-star': 'fa-star-o'" @click="star"></i>
    </el-tooltip>
</template>

<script>
    import Github from 'github-api';

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
                let token = db.get('token').value();
                let repository = new Github({token: token}).getRepo(owner, repo);

                if (this.isStarred) {
                    repository.unstar();

                    let repositories = db.get('repositories').value();
                    _.remove(repositories, repository => {
                        return repository.repo.id === this.repository.repo.id;
                    });

                    db.set('repositories', repositories).write();
                } else {
                    repository.star();

                    let obj = this.repository;
                    Object.assign(obj, {starred_at: ''});
                    db.get('repositories').push(obj).write();
                }

                this.isStarred = !this.isStarred;
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