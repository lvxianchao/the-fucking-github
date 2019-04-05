<template>
    <el-header>
        <el-row :gutter="10">
            <!--按已打标签和未打标签过滤-->
            <el-col :span="3">
                <el-select v-model="selectedTagStatus" default-first-option size="small"
                           @change="filterRepositoriesWithTagStatus()">
                    <el-option v-for="status in tagStatus" :key="status.value" :value="status.value"
                               :label="status.label"></el-option>
                </el-select>
            </el-col>

            <!--按标签过滤-->
            <el-col :span="6">
                <el-select v-model="selectedTagIds" multiple filterable default-first-option
                           placeholder="Filter with tags" size="small" clearable @change="filterRepositoriesWithTags()">
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
                tagStatus: db.get('tagStatus').value(),
                selectedTagStatus: 'all',
            }
        },

        methods: {
            // 按是否已打标签过滤项目
            filterRepositoriesWithTagStatus() {
                this.$emit('filter-repositories-with-tag-status', this.selectedTagStatus);
            },

            // 按标签过滤项目
            filterRepositoriesWithTags() {
                this.$emit('filter-repositories-with-tags', this.selectedTagIds);
            }
        },

        mounted() {
            this.tags = db.get('tags').value();
        },
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
</style>