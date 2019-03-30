<template>
    <el-container>
        <el-header class="header" style="height: auto;">
            <el-card>
                <el-row>
                    <el-col :span="24">
                        <img class="avatar" :src="user.avatar_url" :alt="user.name">
                        <span class="username">{{ user.name }}</span>

                        <div class="starred">
                            <i class="el-icon-star-on"></i>
                            <span>{{ count }}</span>
                        </div>
                    </el-col>
                </el-row>
            </el-card>
        </el-header>

        <el-container class="content">
            <el-aside style="width: 400px;">
                <el-card>
                    <el-row>
                        <el-col :span="24">
                            <div class="grid-content bg-purple-dark">
                                <el-card v-for="repository in repositories" :key="repository.id" class="repository-card">
                                    <div style="width: 20px; float: left; margin-right: 5px;">
                                        <img :src="repository.owner.avatar_url" :alt="repository.owner.login"
                                             style="max-width: 100%;border-radius: 50%;">
                                    </div>
                                    <span style="line-height: 20px;">{{ repository.owner.login }}</span>
                                    <div style="float: right; font-size: 20px; color: blueviolet;">{{ repository.name }}</div>

                                    <div style="margin: 15px 0;">{{ repository.description }}</div>

                                    <div>
                                        <div style="float: left; height: 20px; line-height: 20px;">
                                            <img style="width: 20px; float: left; margin-right: 5px;"
                                                 :src="languageIcon(repository.language)">
                                            <div style="float: left;">{{ repository.language ? repository.language : 'unknown' }}</div>
                                        </div>
                                        <div style="float: right;">
                                            <i class="el-icon-star-off"></i>
                                            <span>{{ repository.stargazers_count }}</span>
                                        </div>
                                        <div style="float: right; margin-right: 10px;">
                                            <i class="el-icon-share"></i>
                                            <span>{{ repository.forks }}</span>
                                        </div>
                                    </div>
                                    <div style="clear: both;"></div>
                                </el-card>
                            </div>
                        </el-col>
                    </el-row>
                </el-card>
            </el-aside>

            <el-container>
                <el-main>Main</el-main>
            </el-container>
        </el-container>
    </el-container>
</template>

<script>
    import Github from 'github-api';

    export default {
        name: 'App',
        data() {
            return {
                user: {},
                count: '',
                repositories: [],
            }
        },
        methods: {
            languageIcon(language) {
                if (!language) {
                    language = 'unknown'
                }

                return 'icons/languages/' + language.toLowerCase() + '.png';
            }
        },
        mounted() {
            let gh = new Github({
                token: 'f70ebc38a97d582872a9ec9fe959e17f1117103d',
            });

            // 获取用户
            let me = gh.getUser();

            // 获取用户信息
            me.getProfile((error, result) => {
                this.user = result;
            });

            // 获取已喜欢的项目
            me.listStarredRepos((error, result) => {
                this.count = result.length;
                this.repositories = result;
                console.log(result);
            });
        }
    }
</script>

<style lang="scss">
    .header {
        padding: 0 5px;
        margin-bottom: 15px;
        height: auto;

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

        .repository-card {
            margin-bottom: 10px;
        }
    }
</style>