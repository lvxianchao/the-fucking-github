<template>
    <div>
        <el-tooltip content="Like this?" placement="left">
            <el-button circle type="default" class="donate" icon="fa fa-thumbs-o-up"
                       @click="donateDialog = true"></el-button>
        </el-tooltip>

        <el-dialog title="Donate for The Fucking Github" :visible.sync="donateDialog" :modal-append-to-body="false"
                   :append-to-body="true">
            <el-tabs type="card">
                <el-tab-pane>
                    <span slot="label"><i class="fa fa-wechat"></i>Wechat</span>
                    <img :src="wechatPng" class="donate-images">
                </el-tab-pane>
                <el-tab-pane>
                    <span slot="label"><img :src="alipaySvg" class="alipay" alt="">Alipay</span>
                    <img :src="alipayJpg" class="donate-images">
                </el-tab-pane>
                <el-tab-pane>
                    <span slot="label"><i class="fa fa-paypal"></i>Paypal</span>
                    <el-button class="paypal">
                        <a href="https://paypal.me/lvxianchao" target="_blank">Donate The Fucking Github by Paypal</a>
                    </el-button>
                </el-tab-pane>
            </el-tabs>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Donate",
        data() {
            return {
                donateDialog: false,
                alipaySvg: chrome.extension.getURL('icons/alipay.svg'),
                alipayJpg: chrome.extension.getURL('icons/alipay.jpg'),
                wechatPng: chrome.extension.getURL('icons/wechat.png'),
            };
        }
    }
</script>

<style scoped lang="scss">
    .donate {
        float: right;
        padding: 0;
        width: 40px;
        height: 40px;
        font-size: 20px;
        color: blueviolet;
    }

    .el-dialog {
        width: 400px;

        .alipay {
            width: 16px;
            position: relative;
            top: 3px;
            margin-right: 2px;
        }

        .donate-images {
            width: 200px;
            display: block;
            margin: auto;
        }

        .paypal {
            display: block;
            margin: auto;

            a {
                text-decoration: none;
                color: blueviolet;
            }
        }
    }
</style>