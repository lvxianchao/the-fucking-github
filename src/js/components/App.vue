<template>
    <el-container v-loading.fullscreen.lock="fullscreenLoading" element-loading-spinner="el-icon-loading"
                  element-loading-background="rgba(0, 0, 0, 0.8)" element-loading-text="Loading...">
        <el-header class="header">
            <el-card class="header-card">
                <el-row>
                    <el-col :span="24">
                        <a :href="user.html_url" target="_blank">
                            <img class="avatar" :src="user.avatar_url" :alt="user.name">
                            <span class="username">{{ user.name }}</span>
                        </a>
                        <div class="starred">
                            <i class="fa fa-star"></i>
                            <span>{{ starredCount }}</span>
                        </div>
                    </el-col>
                </el-row>
            </el-card>
        </el-header>

        <Search @filter-repositories-with-tags="filterRepositoriesWithTags($event)"></Search>

        <el-container class="content">
            <el-aside class="aside" style="width: 400px;">
                <div class="aside-scroll">
                    <el-card class="aside-card">
                        <el-row>
                            <el-col :span="24">
                                <div class="grid-content bg-purple-dark">
                                    <el-card v-for="(repository, index) in repositories" :key="repository.repo.id"
                                             class="repository-card"
                                             :class="{'aside-card-selected': index === asideCardSelectedIndex}"
                                             @click.native="showRepository(repository, index)"
                                             shadow="hover">
                                        <div class="owner-avatar">
                                            <img :src="repository.repo.owner.avatar_url"
                                                 :alt="repository.repo.owner.login">
                                        </div>
                                        <span class="owner-name">{{ repository.repo.owner.login }}</span>
                                        <div class="repository-name">{{ repository.repo.name }}</div>

                                        <div class="repository-description">{{ repository.repo.description }}</div>

                                        <div>
                                            <div class="language">
                                                <img :src="languageIcon(repository.repo.language)">
                                                <div>{{ repository.repo.language ? repository.repo.language : 'unknown' }}</div>
                                            </div>
                                            <div class="starred-at">
                                                <i class="fa fa-clock-o"></i>
                                                <span>{{ repository.starred_at.substr(0, 10) }}</span>
                                            </div>
                                            <div class="forks-count">
                                                <i class="fa fa-code-fork"></i>
                                                <span>{{ repository.repo.forks }}</span>
                                            </div>
                                            <div class="starred-count">
                                                <i class="fa fa-star-o"></i>
                                                <span>{{ repository.repo.stargazers_count }}</span>
                                            </div>
                                        </div>
                                        <div class="clear"></div>
                                    </el-card>
                                </div>
                            </el-col>
                        </el-row>
                    </el-card>
                </div>
            </el-aside>

            <el-container class="main-container">
                <el-main class="main">
                    <el-card class="repository-container">
                        <header>
                            <a :href="repository.repo.html_url" target="_blank" class="full-name">
                                <i class="fa fa-home"></i>
                                <span>{{ repository.repo.full_name }}</span>
                            </a>

                            <el-tooltip effect="dark" placement="top" content="Clone with HTTPS">
                                <el-button type="info" icon="fa fa-clone" circle class="clone"></el-button>
                            </el-tooltip>

                            <div class="time">
                                <div>
                                    <i class="fa fa-clock-o"></i>
                                    <span>Created: {{ repository.repo.created_at }}</span>
                                </div>
                                <div>
                                    <i class="fa fa-clock-o"></i>
                                    <span>Updated: {{ repository.repo.updated_at }}</span>
                                </div>
                                <div v-if="repository.starred_at">
                                    <i class="fa fa-clock-o"></i>
                                    <span>Starred: {{ repository.starred_at.substr(0, 10) }}</span>
                                </div>
                            </div>
                        </header>

                        <p class="description">{{ repository.repo.description }}</p>
                        <Tags :repository="repository"></Tags>
                        <div class="markdown-body" v-html="readme"></div>
                    </el-card>
                </el-main>
            </el-container>
        </el-container>
    </el-container>
</template>

<script>
    import Github from 'github-api';
    import 'github-markdown-css';
    import axios from 'axios';
    import Tags from './Tags';
    import Search from './Search';

    export default {
        name: 'App',
        data() {
            return {
                token: '',
                github: {},
                user: {},
                starredCount: '',
                repositories: [],
                repository: {
                    repo: {}
                },
                readme: '',
                asideCardSelectedIndex: 0,
                fullscreenLoading: true,
            }
        },
        components: {
            Tags, Search,
        },
        methods: {
            // 处理语言 icon
            languageIcon(language) {
                if (!language) {
                    language = 'unknown'
                }

                return 'icons/languages/' + language.toLowerCase() + '.png';
            },

            // 当点击左侧内的项目卡片时，显示项目相关内容
            showRepository(repository, index) {
                // 侧边栏卡片添加选中样式
                this.asideCardSelectedIndex = index;

                // 处理时间格式，只显示 Y-m-d
                repository.repo.created_at = repository.repo.created_at.substr(0, 10);
                repository.repo.updated_at = repository.repo.updated_at.substr(0, 10);
                this.repository = repository;

                // 渲染 README.md
                const repo = this.github.getRepo(repository.repo.owner.login, repository.repo.name);
                repo.getReadme(repository.repo.default_branch, true, (error, markdown) => {
                    const md = this.github.getMarkdown();

                    md.render({
                        text: markdown,
                        mode: 'gfm',
                        context: repository.repo.full_name,
                    }, (error, render) => {
                        this.readme = render;
                    });
                });
            },

            // 获取已 Star 数目和项目列表
            getStarredList() {
                let url = 'https://api.github.com/user/starred';

                let options = {
                    params: {
                        sort: 'created',
                        per_page: 1,
                        page: 1,
                    },
                    headers: {
                        Authorization: 'token ' + this.token,
                        Accept: 'application/vnd.github.v3.star+json',
                    },
                };

                // 最后一页页码
                let lastPage = 0;

                axios.get(url, options)
                // 获取总页数
                    .then((response) => {
                        let links = response.headers.link.split(',');
                        this.starredCount = links[1].match(/&page=(\d+)/)[1];
                        lastPage = Math.ceil(this.starredCount / 100);
                    })
                    // 优先获取第一页的数据渲染
                    .then(async () => {
                        options.params.page = 1;
                        options.params.per_page = 100;

                        await axios.get(url, options).then((response) => {
                            this.fullscreenLoading = false;
                            this.repositories = response.data;
                        });
                    })
                    // 获取后续页码的数据
                    .then(async () => {
                        let promises = [];

                        for (let i = 2; i <= lastPage; i++) {
                            options.params.page = await i;
                            options.params.per_page = 100;
                            promises.push(axios.get(url, options));
                        }

                        axios.all(promises)
                            .then((results) => {
                                results.forEach((response) => {
                                    this.repositories = _.concat(this.repositories, response.data);
                                });

                                // 填充项目表
                                db.set('repositories', this.repositories).write();
                            });
                    });
            },

            // 内容区默认显示 The Fucking Github
            theFuckingGithub() {
                const TheFuckingGithub = this.github.getRepo('lvxianchao', 'the-fucking-github');
                TheFuckingGithub.getDetails((error, result) => {
                    this.repository.repo = result;
                    this.showRepository(this.repository);
                });
            },

            // 获取当前用户信息
            getUserInfo() {
                this.github.getUser().getProfile((error, result) => {
                    this.user = result;
                });
            },

            // 按标签过滤项目
            filterRepositoriesWithTags(tags) {
                if (tags.length === 0) {
                    // 清空了过滤标签，显示所有的项目。
                    this.repositories = db.get('repositories').value();
                } else {
                    let repositoryIds = [];
                    tags.forEach(tag => {
                        repositoryIds = db.get('tagsAndRepositories').filter({tagId: tag}).map('repositoryId').value();
                    });

                    this.repositories = this.repositories.filter(repository => {
                        return _.indexOf(repositoryIds, repository.repo.id) >= 0;
                    });
                }
            }
        },

        mounted() {
            this.token = db.get('token').value();
            this.github = new Github({token: this.token});

            // 获取用户信息
            this.getUserInfo();
            // 读取已 Star 数目和列表
            this.getStarredList();
            // 默认显示：The Fucking Github 内容
            this.theFuckingGithub();
        }
    }
</script>

<style lang="scss">
    $main-color: #787AF6;
    .el-button--text {
        color: $main-color;
    }

    .header {
        padding: 0 5px;
        margin-bottom: 15px;
        height: auto;
        position: fixed;
        width: 100%;
        z-index: 1;
        top: 0;
        border-top: 3px solid $main-color;

        .el-card__body {
            padding: 10px 20px;
        }

        a {
            text-decoration: none;
            color: #333;

            .avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                float: left;
                margin-right: 10px;
            }

            .username {
                height: 40px;
                line-height: 40px;
                font-size: 28px;
                float: left;
            }
        }

        .starred {
            font-size: 28px;
            line-height: 40px;
            float: left;
            margin-left: 30px;
        }
    }

    .content {
        padding: 0 5px;

        /*侧边栏*/
        .aside {
            width: 400px;
            position: fixed;
            top: 180px;
            bottom: 0;
            overflow-x: hidden;

            .aside-scroll {
                width: 420px;
                overflow-x: hidden;
                height: 100%;

                .aside-card {
                    width: 400px;

                    .repository-card {
                        margin-bottom: 15px;

                        &.aside-card-selected {
                            border-color: $main-color;
                            -webkit-box-shadow: 0 2px 12px 12px rgba(138, 43, 225, .1);
                            -moz-box-shadow: 0 2px 12px 12px rgba(138, 43, 225, .1);
                            box-shadow: 0 2px 12px 12px rgba(138, 43, 225, .1);
                        }

                        &:hover {
                            border-color: #cccccc;
                        }

                        .owner-avatar {
                            width: 20px;
                            float: left;
                            margin-right: 5px;

                            img {
                                max-width: 100%;
                                border-radius: 3px;
                            }
                        }

                        .owner-name {
                            line-height: 20px;
                        }

                        .repository-name {
                            float: right;
                            font-size: 20px;
                            color: blueviolet;
                        }

                        .repository-description {
                            margin: 15px 0;
                        }

                        .language {
                            float: left;
                            height: 20px;
                            line-height: 20px;

                            img {
                                width: 20px;
                                float: left;
                                margin-right: 5px;
                            }

                            div {
                                float: left;
                            }
                        }

                        .starred-count {
                            float: right;
                            margin-right: 10px;
                        }

                        .forks-count {
                            float: right;
                            margin-right: 10px;
                        }

                        .starred-at {
                            float: right;
                        }

                        .clear {
                            clear: both;
                        }
                    }
                }
            }
        }

        /*主体内容*/
        .main-container {
            position: fixed;
            top: 180px;
            left: 400px;
            bottom: 0;
            right: 5px;

            .main {
                padding: 0;

                .repository-container {
                    height: 100%;
                    overflow-y: auto;

                    header {
                        font-size: 24px;

                        .full-name {
                            text-decoration: none;
                            color: #333333;
                            margin-right: 30px;

                            .el-button {
                                font-size: 24px;
                            }
                        }

                        .time {
                            color: #cccccc;
                            font-size: 14px;
                            margin-top: 15px;

                            div {
                                display: inline-block;
                                margin-right: 20px;
                            }
                        }

                        .clone {
                            float: right;
                            cursor: pointer;
                        }
                    }

                    .description {
                        margin-top: 20px;
                        font-size: 16px;
                        color: #666;
                    }

                    /*.tags {*/
                    /*    margin-top: 20px;*/

                    /*    .el-select {*/
                    /*        width: 100%;*/
                    /*    }*/
                    /*}*/

                    .markdown-body {
                        box-sizing: border-box;
                        min-width: 800px;
                        max-width: 980px;
                        margin: 0 auto;
                        padding: 45px;
                    }

                    @media (max-width: 767px) {
                        .markdown-body {
                            padding: 15px;
                        }
                    }
                }
            }
        }
    }
</style>