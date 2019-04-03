<template>
    <div class="tags">
        <el-select v-model="selected" multiple filterable allow-create placeholder="add tags" default-first-option>
            <el-option v-for="tag in tags" :key="tag.name" :value="tag.id" :label="tag.name"></el-option>
        </el-select>
    </div>
</template>

<script>
    export default {
        name: "Tags",
        props: {
            tags: {
                type: Array,
                required: true,
            },
            repository: {
                type: Object,
                required: true,
            }
        },
        data() {
            return {
                selected: [],
            }
        },
        watch: {
            selected: function () {
                let table = db.get('repositorySelectedTags');
                table.remove({id: this.repository.repo.id}).write();
                table.push({
                    id: this.repository.repo.id,
                    tags: this.selected,
                }).write();
            }
        }
    }
</script>

<style scoped lang="scss">
    .tags {
        margin-top: 20px;

        .el-select {
            width: 100%;
        }
    }
</style>