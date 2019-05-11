<template>
    <el-container v-if="hasToken">
        <el-header class="header">
            <el-card class="header-card">
                <el-row>
                    <el-col :span="24">
                        <!--Logo-->
                        <el-tooltip content="The Fucking Github" placement="bottom-start">
                            <a href="https://github.com/lvxianchao/the-fucking-github" target="_blank" class="logo">
                                <img :src="loading ? loadingImgSrc : logoImgSrc" alt="The Fucking Github">
                            </a>
                        </el-tooltip>
                        <!--Me-->
                        <a :href="user.html_url" target="_blank">
                            <img class="avatar" :src="user.avatar_url" :data-src="user.avatar_url" :alt="user.name">
                            <span class="username">{{ user.name }}</span>
                        </a>
                        <!--Starred-->
                        <div class="starred">
                            <i class="fa fa-star"></i>
                            <span>{{ starredCount }}</span>
                        </div>
                        <!--Following-->
                        <Followers placeholder="Following" :followers="following"></Followers>
                        <!--Followers-->
                        <Followers placeholder="Followers" :followers="followers"></Followers>
                        <!--Search Online-->
                        <SearchOnline @searchOnlineResult="searchOnlineResult"></SearchOnline>
                        <!--Donate-->
                        <Donate></Donate>
                    </el-col>
                </el-row>
            </el-card>
        </el-header>

        <Search @filter="filter" :starredCount="starredCount" @triggerToc="triggerToc"></Search>

        <el-container class="content">
            <el-aside class="aside" style="width: 400px;" v-lazy-container="{selector: 'img'}">
                <div class="aside-scroll">
                    <el-badge :value="this.repositories.length" type="primary" class="repositories-count"/>
                    <el-card class="aside-card">
                        <div class="grid-content bg-purple-dark">
                            <VirtualList ref="virtualList" :size="100" :remain="10" style="height: 100%;">
                                <el-card v-for="(repository, index) in repositories"
                                         :key="repository.repo.id" class="repository-card"
                                         :class="{'aside-card-selected': index === asideCardSelectedIndex}"
                                         @click.native="showRepository(repository, index)"
                                         shadow="hover">
                                    <div class="owner-avatar">
                                        <img :alt="repository.repo.owner.login"
                                             :data-src="repository.repo.owner.avatar_url"
                                             :src="repository.repo.owner.avatar_url">
                                    </div>
                                    <span class="owner-name">{{ repository.repo.owner.login }}</span>
                                    <div class="repository-name">{{ repository.repo.name }}</div>

                                    <div class="repository-description">{{ repository.repo.description }}</div>

                                    <div>
                                        <div class="language">
                                            <img :src="languageIcon(repository.repo.language)"
                                                 :alt="repository.repo.language"
                                                 :data-src="languageIcon(repository.repo.language)">
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
                            </VirtualList>
                        </div>
                    </el-card>
                </div>
            </el-aside>

            <el-container class="main-container">
                <el-main class="main">
                    <el-card class="repository-container">
                        <el-header style="height: auto;">
                            <header>
                                <a :href="repository.repo.html_url" target="_blank" class="full-name">
                                    <i class="fa fa-home"></i>
                                    <span>{{ repository.repo.full_name }}</span>
                                </a>

                                <el-tooltip effect="dark" placement="top" content="Clone with HTTPS">
                                    <el-button type="info" icon="fa fa-clone" circle class="clone"
                                               @click="copyCloneUrlWithHttps" size="small">
                                    </el-button>
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
                        </el-header>

                        <el-container class="readme-area" v-loading="readmeLoading">
                            <el-main>
                                <div class="markdown-body" v-html="readmeHtmlWithAnchor"></div>
                            </el-main>

                            <el-aside v-show="isTocShow" class="toc-aside">
                                <Toc :readmeHtmlWithoutAnchor="readmeHtml" :repository="repository" @render="render"></Toc>
                            </el-aside>
                        </el-container>
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
    import Toc from './Toc';
    import Followers from './Followers';
    import SearchOnline from './SearchOnline';
    import Donate from './Donate';
    import VirtualList from 'vue-virtual-scroll-list';

    export default {
        name: 'App',
        data() {
            return {
                hasToken: false,
                loading: true,
                loadingImgSrc: chrome.extension.getURL('icons/loading.gif'),
                logoImgSrc: chrome.extension.getURL('icons/128.png'),
                token: '',
                github: {},
                user: {},
                starredCount: 0,
                repositories: db.get('repositories').value(),
                repository: {
                    repo: {}
                },
                readmeHtml: '',
                readmeMarkdown: '',
                asideCardSelectedIndex: 0,
                fullscreenLoading: true,
                following: [],
                followers: [],
                readmeHtmlWithAnchor: '',
                readmeLoading: true,
                hasSearchOnline: false,
                filtering: false,
                isTocShow: db.get('isTocShow').value(),
            }
        },
        components: {
            Tags, Search, Toc, Followers, SearchOnline, Donate, VirtualList,
        },
        methods: {
            // 处理语言 icon
            languageIcon(language) {
                if (!language) {
                    language = 'unknown'
                }

                return chrome.extension.getURL('icons/languages/' + language.toLowerCase() + '.png');
            },

            // 当点击左侧内的项目卡片时，显示项目相关内容
            showRepository(repository, index) {
                this.readmeLoading = true;

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
                        this.readmeHtml = render;
                        this.readmeMarkdown = markdown;
                        this.readmeLoading = false;
                        document.querySelector('.repository-container').scrollTop = 0;
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
                    // 获取后续页码的数据
                    .then(async () => {
                        let promises = [];

                        for (let i = 1; i <= lastPage; i++) {
                            options.params.page = await i;
                            options.params.per_page = 100;
                            promises.push(axios.get(url, options));
                        }

                        axios.all(promises)
                            .then((results) => {
                                let data = [];
                                results.forEach((response) => {
                                    data = _.concat(data, response.data);
                                });

                                // 填充项目表
                                db.set('repositories', data).write();
                                // 如果没有启用在线搜索，则更新项目区
                                if (!this.hasSearchOnline && !this.filtering) {
                                    this.repositories = data;
                                }
                                this.loading = false;
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
                    if (!result) {
                        db.set('token', '').write();
                        chrome.storage.sync.set({'token': ''});
                        alert('Sorry, the Access Token is invalid, please check it again.');
                        window.close();
                    }

                    this.user = result;
                });
            },

            // 按条件过滤项目
            filter(repositories) {
                this.filtering = true;

                this.repositories = repositories;
                this.asideCardSelectedIndex = null;

                // 强制渲染虚拟滚动，修复：当过滤的项目为 0 以后，再次过滤不显示列表的问题。
                this.$refs.virtualList.forceRender();
            },

            // 获取 Following 和 Followers 的数据
            getFollowingAndFollowers() {
                axios.get('https://api.github.com/user/followers', {
                    headers: {
                        Authorization: 'token ' + this.token,
                    },
                }).then(response => {
                    this.followers = response.data;
                });

                axios.get('https://api.github.com/user/following', {
                    headers: {
                        Authorization: 'token ' + this.token,
                    },
                }).then(response => {
                    this.following = response.data;
                });
            },

            // 渲染 Readme.md
            render(html) {
                this.readmeHtmlWithAnchor = html;
            },

            // 复制项目 HTTPS 克隆地址到剪切板
            copyCloneUrlWithHttps() {
                this.$copyText(this.repository.repo.clone_url).then(e => {
                    this.$message.success('Copied the clone url with HTTPS to clipboard successfully.');
                }, e => {
                    this.$message.error('Sorry, The Fucking Github cannot copy the url.');
                });
            },

            // 搜索在线项目
            searchOnlineResult(result, status) {
                this.repositories = result;

                // 阻止未加载完的 Star 覆盖项目区
                this.hasSearchOnline = status;
            },

            // 获取用户 Github 授权 Token
            getToken() {
                let html = '<a target="_blank" href="https://github.com/lvxianchao/the-fucking-github" style="text-decoration: none; color: blueviolet;"><strong>How to get the token?</strong></a>';
                this.$prompt(html, 'Github Access Token', {
                    confirmButtonText: 'Done',
                    showCancelButton: false,
                    showClose: false,
                    dangerouslyUseHTMLString: true,
                    closeOnClickModal: false,
                    closeOnPressEscape: false,
                    inputValidator: value => {
                        if (!value || value.length !== 40) {
                            return false;
                        }
                    },
                    inputErrorMessage: 'Please input the Access Token',
                }).then(({value}) => {
                    chrome.storage.sync.set({'token': value});
                    this.token = value;
                    db.set('token', value).write();
                    window.location.reload();
                });
            },

            // 切换 TOC 开关
            triggerToc() {
                this.isTocShow = !this.isTocShow;
                db.set('isTocShow', this.isTocShow).write();
            }
        },

        mounted() {
            this.token = db.get('token').value();
            if (!this.token) {
                return this.getToken();
            }
            this.hasToken = true;
            this.github = new Github({token: this.token});

            // 获取用户信息
            this.getUserInfo();
            // 读取已 Star 数目和列表
            this.getStarredList();
            // 默认显示：The Fucking Github 内容
            this.theFuckingGithub();
            // 获取当前用户的 Following 和 Followers
            this.getFollowingAndFollowers();
        },
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
        /*min-width: 1366px;*/

        .el-card__body {
            padding: 10px 20px;

            .logo {
                float: left;
                display: inline-block;
                width: 40px;
                height: 40px;
                overflow: hidden;
                margin-right: 10px;
                outline: none;

                img {
                    width: 100%;
                }
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
    }

    .content {
        padding: 0 5px;
        position: fixed;
        top: 130px;
        bottom: 0;
        left: 0;
        right: 0;

        /*侧边栏*/
        .aside {
            width: 400px;
            overflow-x: hidden;

            .aside-scroll {
                width: 420px;
                overflow-x: hidden;
                height: 100%;

                .repositories-count {
                    .el-badge__content {
                        width: 400px;
                        position: fixed;
                        top: 130px;
                        z-index: 100;
                        -webkit-border-radius: 3px;
                        -moz-border-radius: 3px;
                        border-radius: 3px;
                        border: 1px dashed blueviolet;
                        background: #ffffff;
                        color: blueviolet;
                    }
                }

                .aside-card {
                    width: 400px;
                    height: 100%;

                    .el-card__body {
                        height: 100%;
                        padding-bottom: 0;

                        .grid-content {
                            width: 400px;
                            height: 100%;
                            padding-right: 6px;
                        }
                    }

                    .repository-card {
                        margin-bottom: 15px;
                        margin-right: 20px;

                        .el-card__body {
                            padding-bottom: 20px;
                        }

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
            right: 5px;

            .main {
                padding: 0;

                .repository-container {
                    height: 100%;
                    overflow-y: auto;

                    .el-card__body {
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

                        .readme-area {
                            justify-content: center;

                            .el-main {
                                max-width: 1000px;
                            }

                            .markdown-body {
                                box-sizing: border-box;
                                max-width: 935px;
                                margin: 0 auto;
                            }

                            .toc-aside {
                                position: sticky;
                                top: 20px;
                                height: 100%;
                                margin-top: 20px;
                            }
                        }
                    }
                }
            }
        }
    }
</style>