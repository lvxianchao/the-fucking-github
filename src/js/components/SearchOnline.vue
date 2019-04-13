<template>
    <el-input placeholder="Search online" v-model="keywords" clearable
              @keyup.enter.native="search" @clear="clear">
        <template slot="prepend">
            <img :src="loadingImgSrc" class="loading" v-show="loading">
            <i class="el-icon-search" v-show="!loading"></i>
        </template>
    </el-input>
</template>

<script>
    import axios from 'axios';

    export default {
        name: "SearchOnline",
        data() {
            return {
                keywords: '',
                loading: false,
                loadingImgSrc: chrome.extension.getURL('icons/loading.gif'),
            };
        },
        methods: {
            search() {
                if (!this.keywords) {
                    this.clear();
                }

                this.loading = true;

                let api = 'https://api.github.com/search/repositories';

                let options = {
                    params: {
                        q: this.keywords,
                        sort: 'stars',
                        order: 'desc',
                        per_page: 50,
                    },
                    headers: {
                        Authorization: 'token ' + db.get('token').value(),
                    },
                };

                axios.get(api, options).then(response => {
                    let data = [];

                    response.data.items.forEach(item => {
                        data.push({starred_at: '', repo: item});
                    });

                    this.$emit('searchOnlineResult', data, true);
                    this.loading = false;
                });
            },

            clear() {
                this.$emit('searchOnlineResult', db.get('repositories').value(), false);
            }
        },
    }
</script>

<style scoped lang="scss">
    .el-input {
        float: left;
        width: 400px;
        margin-left: 30px;

        .loading {
            width: 14px;
        }
    }
</style>