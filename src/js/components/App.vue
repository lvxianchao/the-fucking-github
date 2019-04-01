<template>
    <el-container>
        <el-header class="header">
            <el-card>
                <el-row>
                    <el-col :span="24">
                        <img class="avatar" :src="user.avatar_url" :alt="user.name">
                        <span class="username">{{ user.name }}</span>

                        <div class="starred">
                            <i class="el-icon-star-on"></i>
                            <span>{{ starredCount }}</span>
                        </div>
                    </el-col>
                </el-row>
            </el-card>
        </el-header>

        <el-container class="content">
            <el-aside class="aside" style="width: 400px;">
                <div class="aside-scroll">
                    <el-card class="aside-card">
                        <el-row>
                            <el-col :span="24">
                                <div class="grid-content bg-purple-dark">
                                    <el-card v-for="repository in repositories" :key="repository.repo.id"
                                             class="repository-card" @click.native="showRepository(repository)"
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
                                            <div class="starred">
                                                <i class="el-icon-star-off"></i>
                                                <span>{{ repository.repo.stargazers_count }}</span>
                                            </div>
                                            <div class="forks">
                                                <i class="el-icon-share"></i>
                                                <span>{{ repository.repo.forks }}</span>
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
                            <a :href="repository.repo.html_url" class="full-name">
                                <i class="el-icon-info"></i>
                                <span>{{ repository.repo.full_name }}</span>
                            </a>

                            <span class="time">Created: {{ repository.repo.created_at }}</span>
                            <span class="time">Updated: {{ repository.repo.updated_at }}</span>

                            <i class="el-icon-document clone"></i>
                        </header>

                        <p class="description">{{ repository.repo.description }}</p>

                        <div class="tags">
                            <el-input placeholder="标签">
                                <template slot="prepend">
                                    <i class="el-icon-share"></i>
                                </template>
                            </el-input>
                        </div>

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
            }
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
            showRepository(repository) {
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
                    .then(() => {
                        options.params.page = 1;
                        options.params.per_page = 100;

                        axios.get(url, options).then((response) => {
                            this.repositories = this.repositories.concat(response.data)
                            console.log(Date.parse(new Date()));
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

                        axios.all(promises).then((results) => {
                            results.forEach((response) => {
                                this.repositories = this.repositories.concat(response.data);
                                console.log(Date.parse(new Date()));
                            });
                        });
                    });
            },
        },

        mounted() {
            this.token = localStorage.getItem('token');

            this.github = new Github({token: this.token});

            // 默认显示：The Fucking Github 内容
            const TheFuckingGithub = this.github.getRepo('lvxianchao', 'the-fucking-github');
            TheFuckingGithub.getDetails((error, result) => {
                this.repository.repo = result;
                this.showRepository(this.repository);
            });

            // 获取用户信息
            this.github.getUser().getProfile((error, result) => {
                this.user = result;
            });


            // 读取已 Star 数目和列表
            this.getStarredList();
        }
    }
</script>

<style lang="scss">
    .header {
        padding: 0 5px;
        margin-bottom: 15px;
        height: auto;
        position: fixed;
        width: 100%;
        z-index: 1;
        top: 0;

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
            top: 100px;
            bottom: 0;
            overflow-x: hidden;

            .aside-scroll {
                width: 420px;
                overflow-x: hidden;
                height: 100%;

                .aside-card {
                    width: 400px;

                    .repository-card {
                        margin-bottom: 10px;

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

                        .starred {
                            float: right;
                        }

                        .forks {
                            float: right;
                            margin-right: 10px;
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
            top: 100px;
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
                        }

                        .time {
                            color: #cccccc;
                            font-size: 14px;
                            margin-right: 10px;
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

                    .tags {
                        margin-top: 20px;
                    }

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