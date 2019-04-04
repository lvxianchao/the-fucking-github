<template>
    <div class="tags" v-show="repository.starred_at">
        <el-select v-model="selected" multiple filterable allow-create placeholder="add tags" default-first-option
                   @change="tagsAndRepositories()">
            <el-option v-for="tag in tags" :key="tag.id" :value="tag.id" :label="tag.name"></el-option>
        </el-select>
    </div>
</template>

<script>
    export default {
        name: "Tags",
        props: {
            repository: {
                type: Object,
                required: true,
            }
        },

        data() {
            return {
                tags: db.get('tags').value(),
                selected: [],
            }
        },

        methods: {
            tagsAndRepositories() {
                console.log(this.selected);
                // 清空关联表
                let tagsAndRepositories = db.get('tagsAndRepositories');
                tagsAndRepositories.remove({repositoryId: this.repository.repo.id}).write();

                this.selected.forEach((item, index) => {
                    let data = {tagId: this.selected[index], repositoryId: this.repository.repo.id};

                    // 当前用户所有的标签数据
                    let tagIds = db.get('tags').map('id').value();
                    let tagNames = db.get('tags').map('name').value();

                    // 处理新添加标签，更新标签表、标签项目关联表
                    if (_.indexOf(tagIds, this.selected[index]) === -1) {
                        if (_.indexOf(tagNames, this.selected[index]) === -1) {
                            // 标签集合处理：如果新添加标签不在标签集合里则添加进集合
                            let id = shortid.generate();
                            this.tags.push({id: id, name: _.last(this.selected)});
                        }
                    }

                    data.tagId = this.tags[index].id;
                    tagsAndRepositories.push(data).write();
                });
            },


        },


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