<template>
  <div class="container">
    <h1>Welcome to JsLibrary, Please Create your fire</h1>
    <el-button type="primary" @click="onClick">增加__tag</el-button>
    <br />
    {{ JSON.stringify(list) }}
    <el-divider direction="vertical"></el-divider>
    {{ listString }}
  </div>
</template>

<script>
export default {
  name: 'app',
  data() {
    return {
      list: [1, 2, 3],
      listString: '',
    };
  },
  methods: {
    onClick() {},
  },
};
</script>

<style lang="less" scoped>
.container {
  text-align: center;
  color: white;
  overflow: auto;
}
</style>
