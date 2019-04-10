<template>
    <el-header>
        <el-row :gutter="10">
            <!--按标签状态过滤-->
            <el-col :span="3">
                <el-select v-model="selectedTagStatus" default-first-option size="small"
                           @change="filterWithTagStatus">
                    <el-option v-for="status in tagStatus" :key="status.value" :value="status.value"
                               :label="status.label"></el-option>
                </el-select>
            </el-col>

            <!--按标签过滤-->
            <el-col :span="6">
                <el-select v-model="selectedTagIds" multiple filterable default-first-option
                           placeholder="Filter with tags" size="small" clearable @change="filterWithTags">
                    <el-option v-for="tag in tags" :key="tag.id" :value="tag.id" :label="tag.name"></el-option>
                </el-select>
            </el-col>

            <!--按名称、作者、描述过滤-->
            <el-col :span="12">
                <el-input prefix-icon="el-icon-search" placeholder="keywords" size="small"
                          @input="filterWithKeywords" v-model="keywords" clearable>
                    <template slot="prepend">
                        <el-checkbox-group v-model="keywordsRange">
                            <el-checkbox label="name">Name</el-checkbox>
                            <el-checkbox label="owner">Owner</el-checkbox>
                            <el-checkbox label="description">Description</el-checkbox>
                        </el-checkbox-group>
                    </template>
                </el-input>
            </el-col>

            <!--按编程语言过滤-->
            <el-col :span="3">
                <el-select v-model="selectedLanguage" default-first-option size="small" filterable
                           @change="filterWithLanguages" placeholder="Languages" clearable>
                    <el-option v-for="language in languages" :key="language.value" :value="language.value"
                               :label="language.label">
                        <span>{{ language.label }}</span>
                        <el-badge class="mark" type="primary" :value="language.total"/>
                    </el-option>
                </el-select>
            </el-col>
        </el-row>
    </el-header>
</template>

<script>
    export default {
        name: 'Search',
        data() {
            return {
                tags: db.get('tags').value(),
                selectedTagIds: [],
                tagStatus: [
                    {
                        value: 'all',
                        label: 'All Repositories',
                    },
                    {
                        value: 'untagged',
                        label: 'Untagged Repositories',
                    },
                    {
                        value: 'tagged',
                        label: 'Tagged Repositories',
                    }
                ],
                selectedTagStatus: 'all',
                keywordsRange: ['name', 'owner', 'description'],
                keywords: '',
                repositories: [],
                languages: [],
                selectedLanguage: '',
            }
        },

        methods: {
            // 提交过滤
            emit() {
                this.$emit('filter', this.repositories);
            },

            // 按标签过滤项目
            filterWithTags(tagIds) {
                if (tagIds.length === 0) {
                    // 清空了过滤标签，显示所有的项目。
                    this.repositories = db.get('repositories').value();
                } else {
                    let repositoryIds = [];

                    tagIds.forEach(tagId => {
                        let ids = db.get('tagsAndRepositories').filter({tagId: tagId}).map('repositoryId').value();
                        repositoryIds.push(ids);
                    });

                    repositoryIds = _.intersection(...repositoryIds);

                    this.repositories = db.get('repositories').value().filter((repository) => {
                        return _.indexOf(repositoryIds, repository.repo.id) >= 0;
                    });
                }

                this.emit();
            },

            // 按打标签的状态过滤项目
            filterWithTagStatus(status) {
                let taggedRepositoriesIds = db.get('tagsAndRepositories').map('repositoryId').value();
                switch (status) {
                    case 'all':
                        this.repositories = db.get('repositories').value();
                        break;
                    case 'untagged':
                        this.repositories = db.get('repositories').value().filter((repository) => {
                            return _.indexOf(taggedRepositoriesIds, repository.repo.id) === -1;
                        });
                        break;
                    case 'tagged':
                        this.repositories = db.get('repositories').value().filter((repository) => {
                            return _.indexOf(taggedRepositoriesIds, repository.repo.id) !== -1;
                        });
                        break;
                }

                this.emit();
            },

            // 按关键字过滤项目
            filterWithKeywords(keywords) {
                this.repositories = db.get('repositories').value().filter(repository => {
                    if (_.indexOf(this.keywordsRange, 'name') !== -1) {
                        if (repository.repo.name.includes(keywords)) {
                            return true;
                        }
                    }
                    if (_.indexOf(this.keywordsRange, 'owner') !== -1) {
                        if (repository.repo.owner.login.includes(keywords)) {
                            return true;
                        }
                    }
                    if (_.indexOf(this.keywordsRange, 'description') !== -1) {
                        if (repository.repo.description && repository.repo.description.includes(keywords)) {
                            return true;
                        }
                    }
                });

                this.emit();
            },

            // 按编程语言过滤
            filterWithLanguages(value) {
                this.repositories = db.get('repositories').value().filter(repository => {
                    return repository.repo.language === value;
                });

                this.emit();
            },

            // 获取编程语言数据
            getLanguages() {
                let languages = db.get('repositories').map('repo.language').value();
                let repositories = db.get('repositories').map('repo').value();

                let data = [];
                _.uniq(languages).forEach(language => {
                    let count = 0;
                    repositories.forEach(repository => {
                        if (repository.language === language) {
                            count++;
                        }
                    });

                    if (language === null) {
                        language = 'Unknown';
                    }

                    data.push({
                        value: language,
                        label: language,
                        icon: language.toLowerCase().replace(' ', '-'),
                        total: count,
                    });
                });

                this.languages = _.orderBy(data, ['total'], 'desc');
            },
        },

        mounted() {
            // 获取编程语言数据
            this.getLanguages();
        }
    }
</script>

<style scoped lang="scss">
    .el-header {
        width: 100%;
        position: absolute;
        top: 80px;
        padding: 0 5px;

        .el-row {
            .el-col {
                .el-select {
                    width: 100%;
                }
            }
        }
    }

    .mark {
        float: right;
        margin-top: 5px;
        box-sizing: border-box;
    }
</style>