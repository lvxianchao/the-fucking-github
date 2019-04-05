<template>
    <el-header>
        <el-row>
            <el-col :span="6">
                <el-select v-model="selectedTagIds" multiple filterable default-first-option
                           placeholder="Filter with tags" size="small" clearable>
                    <el-option v-for="tag in tags" :key="tag.id" :value="tag.id" :label="tag.name"></el-option>
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
                tags: [],
                selectedTagIds: [],
            }
        },

        mounted() {
            this.tags = db.get('tags').value();
        },

        watch: {
            selectedTagIds: function (n, o) {
                this.$emit('filter-repositories-with-tags', n);
            }
        }
    }
</script>

<style scoped lang="scss">
    .el-header {
        width: 100%;
        position: absolute;
        top: 80px;
        padding: 0 5px;

        .el-select {
            width: 100%;
        }

        /*.el-card {*/
        /*    .el-card__body {*/
        /*        padding: 5px 5px;*/

        /*        */
        /*    }*/


        /*}*/
    }
</style>