<template>
    <el-badge :value="followers.length" type="primary" class="badge">
        <el-select :placeholder="placeholder" class="following-and-followers" value="">
            <el-option value="" style="margin-bottom: 10px;" v-for="follower in followers"
                       :key="follower.id">
                <a :href="follower.html_url" target="_blank"
                   style="text-decoration: none; color: #666666;">
                    <img :src="follower.avatar_url" :data-src="follower.avatar_url"
                         :alt="follower.login"
                         style="width: 30px; border-radius: 5px; margin-right: 10px; float: left;">
                    <span>{{ follower.login }}</span>
                </a>
            </el-option>
        </el-select>
    </el-badge>
</template>

<script>
    export default {
        name: "Followers",
        props: {
            count: {
                require: true,
            },
            placeholder: {
                require: true,
                type: String,
            },
            followers: {
                require: true,
                type: Array,
            }
        }
    }
</script>

<style scoped lang="scss">
    .badge {
        float: left;

        .following-and-followers {
            margin-left: 30px;
        }
    }
</style>