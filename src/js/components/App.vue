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
                            <span>{{ repositories.length + 1 }}</span>
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
                                    <el-card v-for="repository in repositories" :key="repository.id"
                                             class="repository-card" @click.native="showRepository(repository)"
                                             shadow="hover">
                                        <div class="owner-avatar">
                                            <img :src="repository.owner.avatar_url" :alt="repository.owner.login">
                                        </div>
                                        <span class="owner-name">{{ repository.owner.login }}</span>
                                        <div class="repository-name">{{ repository.name }}</div>

                                        <div class="repository-description">{{ repository.description }}</div>

                                        <div>
                                            <div class="language">
                                                <img :src="languageIcon(repository.language)">
                                                <div>{{ repository.language ? repository.language : 'unknown' }}</div>
                                            </div>
                                            <div class="starred">
                                                <i class="el-icon-star-off"></i>
                                                <span>{{ repository.stargazers_count }}</span>
                                            </div>
                                            <div class="forks">
                                                <i class="el-icon-share"></i>
                                                <span>{{ repository.forks }}</span>
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
                            <a :href="repository.html_url" class="full-name">
                                <i class="el-icon-info"></i>
                                <span>{{ repository.full_name }}</span>
                            </a>

                            <span class="time">Created: {{ repository.created_at }}</span>
                            <span class="time">Updated: {{ repository.updated_at }}</span>

                            <i class="el-icon-document clone"></i>
                        </header>

                        <p class="description">{{ repository.description }}</p>

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

    export default {
        name: 'App',
        data() {
            return {
                github: {},
                user: {},
                count: '',
                repositories: [],
                repository: {},
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
                repository.created_at = repository.created_at.substr(0, 10);
                repository.updated_at = repository.updated_at.substr(0, 10);
                this.repository = repository;
                console.info(repository);

                // 渲染 README.md
                const repo = this.github.getRepo(repository.owner.login, repository.name);
                repo.getReadme(repository.default_branch, true, (error, markdown) => {
                    const md = this.github.getMarkdown();

                    md.render({
                        text: markdown,
                        mode: 'gfm',
                        context: repository.full_name,
                    }, (error, render) => {
                        console.log(render);
                        this.readme = render;
                    });
                });
            },
        },
        mounted() {
            let gh = new Github({
                token: '',
            });

            this.github = gh;

            // 默认显示：The Fucking Github 内容
            const TheFuckingGithub = gh.getRepo('lvxianchao', 'the-fuking-github');
            TheFuckingGithub.getDetails((error, result) => {
                this.repository = result;
                this.showRepository(result);
            });

            // 获取用户
            let me = gh.getUser();

            // 获取用户信息
            me.getProfile((error, result) => {
                this.user = result;
            });

            // window.localStorage.setItem('repositories', JSON.stringify(this.repositories));

            this.repositories = JSON.parse(window.localStorage.getItem('repositories'));
            // 获取已喜欢的项目
            // me.listStarredRepos((error, result) => {
            //     this.count = result.length;
            //     // this.repositories = result;
            //     console.log(result);
            // });
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

                    .description{
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