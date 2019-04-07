<template>
    <el-card shadow="hover">
        <el-tree :data="md" :props="defaultProps" @node-click="handleNodeClick" :highlight-current="true"
                 :default-expand-all="true" :expand-on-click-node="false"></el-tree>
    </el-card>
</template>

<script>
    import MarkdownContents from 'markdown-contents';

    export default {
        name: "Toc",
        props: {
            markdown: {
                type: String,
                require: true,
            }
        },
        data() {
            return {
                md: [],
                defaultProps: {
                    children: 'descendants',
                    label: 'name',
                },
            }
        },
        components: {
            MarkdownContents,
        },
        methods: {
            handleNodeClick(data, node) {
                console.log(data, node);
                return false;
            }
        },
        watch: {
            markdown: function (n, o) {
                this.md = MarkdownContents(n).tree();
                console.log(this.md);
            }
        },
    }
</script>

<style scoped>
    .el-card {
        position: fixed;
        margin-top: 45px;
    }
</style>