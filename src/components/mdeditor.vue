<template>
  <section class="section">
    <div class="container">
    <b-taglist attached>
        <b-tag type="is-white">First</b-tag>
        <b-tag type="is-primary" closable>Second</b-tag>
        <b-tag type="is-info">Third</b-tag>
        <b-tag type="is-dark">Fourth</b-tag>
        <b-tag type="is-warning">Fifth</b-tag>
        <b-tag type="is-success">Fifth</b-tag>
        <b-tag type="is-black">GM8135s</b-tag>
        <b-tag type="is-info">Fifth</b-tag>
        <b-tag type="is-info">Fifth</b-tag>
    </b-taglist>


      <h1 class="title">{{fileName}}<span v-if="content_changed">*</span></h1>
      <h3 class="subtitle">{{path}}</h3>
      <mavon-editor style="height: 100%; z-index:inherit;" ref="mavEditor" v-model="content" :toolbars="toolbars" @imgAdd="$imgAdd" @imgDel="$imgDel" @imgSubmit="$imgSubmit" @save="$save"></mavon-editor>
    </div>
  </section>
</template>
<script>
import { mavonEditor } from 'mavon-editor'


import axios from 'axios';
import matter from 'gray-matter';

const NOT_FOUND = 201;
const NOT_PERMIT = 103;



export default {
  name: 'editor',

  components: {
    mavonEditor
  },

  data() {
    return {
      content_changed: false,
      path: this.$route.path,
      content: "",
      img_file: {},
      toolbars: {
        bold: false, // 粗体
        italic: false, // 斜体
        header: false, // 标题
        underline: false, // 下划线
        strikethrough: false, // 中划线
        mark: false, // 标记
        superscript: false, // 上角标
        subscript: false, // 下角标
        quote: false, // 引用
        ol: false, // 有序列表
        ul: false, // 无序列表
        link: false, // 链接
        imagelink: true, // 图片链接
        code: false, // code
        table: false, // 表格
        fullscreen: false, // 全屏编辑
        readmodel: true, // 沉浸式阅读
        htmlcode: false, // 展示html源码
        help: false, // 帮助
        /* 1.3.5 */
        undo: false, // 上一步
        redo: false, // 下一步
        trash: false, // 清空
        save: true, // 保存（触发events中的save事件）
        /* 1.4.2 */
        navigation: true, // 导航目录
        /* 2.1.8 */
        alignleft: false, // 左对齐
        aligncenter: false, // 居中
        alignright: false, // 右对齐
        /* 2.2.1 */
        subfield: false, // 单双栏模式
        preview: true, // 预览
      }
    }
  },

  methods: {

    $imgAdd(pos, $file) {
      console.dir($file);
      this.img_file[pos] = $file;
    },

    $imgDel(pos) {
      console.log(pos);
      delete this.img_file[pos];
    },

    $imgSubmit() {
      // upload files in one request.
      console.dir(this.img_file);
      /*
      ['./0'] = {
        lastModified: 1503687283000,
        lastModifiedDate: Sat Aug 26 2017 02:54:43 GMT+0800 (CST) {},
        name: "03a6cda046bae0e3a21cb4570077a887.jpg",
        size: 40712,
        type: "image/jpeg",
        webkitRelativePath: "",
      },
      ...

      */
      let self = this;

      var formdata = new FormData();
      for (var _img in this.img_file) {
        formdata.append("attachment", this.img_file[_img]);
      }


      let path = '/api/v1/exmem/upload';
      let jwt = this.$store.state.common.me.jwt || "";
      /*
            axios({
              url: path,
              method: 'post',
              data: formdata,
              headers: { 'Content-Type': 'multipart/form-data', },
            })

      */
      axios.post(path, formdata, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'bearer ' + jwt
          },
        })

        .then((res) => {
          console.log(res.data);
          /*
          [   {  
              "fieldname":"file",
              "originalname":"03a6cda046bae0e3a21cb4570077a887.jpg",
              "encoding":"7bit",
              "mimetype":"image/jpeg",
              "name":"file-1507482916349.jpg",
              "url":"http://exmem.oss-cn-beijing.aliyuncs.com/file-1507482916349.jpg"
              },
              ...
          ]
          */
          //编辑器使用类如 './1' 这类路径，上传之后根据返回url，替换为实际路径
          let name2pos = {};
          for (var _img in this.img_file) {
            name2pos[this.img_file[_img].name] = _img;
          }

          for (var i in res.data) {
            let pos = name2pos[res.data[i].originalname];
            //更新本地图片url
            self.$refs.mavEditor.$img2Url(pos, res.data[i].url);
            //删除 工具栏内待上传图片列表
            self.$refs.mavEditor.$refs.toolbar_left.$imgDelByFilename(pos);
            //自己维护的列表也要清理
            self.$imgDel(pos)
          }
        })

        //可能过期，则清除本地jwt， 再次auth
        .catch(function(error) {
          console.log("Upload error, 可能令牌过期");
          console.dir(error);

          //更新两个地方
          localStorage.jwt = "";
          self.$store.dispatch('setJwt', "");

          setTimeout(self.auth, 2000);
        })
    },

    $save: function() {
      this.saveToPath(this.path);
    },

    auth_validate: function(jwt, onOK, onFail) {
      //检查令牌 是否有效
      //若有效 更新之
      let self = this
      let path = `/api/v1/me`;
      return axios.get(path, { headers: { 'Authorization': 'bearer ' + jwt } })

        .then(function(res) {
          //console.log(res);
          let mine = res.data;
          //更新me 和 localstorage
          self.$store.dispatch('setMe', mine);
          localStorage.jwt = mine.jwt;

          //并 setPath
          if (onOK) onOK();
        })

        //可能过期，则清除本地jwt， 再次auth
        .catch(function(error) {
          console.log("/api/v1/me  error, 令牌可能过期");
          console.dir(error);


          self.$toast.open('令牌可能过期.');

          //更新两个地方
          localStorage.jwt = "";
          self.$store.dispatch('setJwt', "");

          if (onFail) onFail();
        })
    },

    auth: function() {
      let self = this

      //检查令牌在 若没有 就输入一个
      let jwt = this.$store.state.common.me.jwt || "";

      if (!jwt) {
        //若不存在， 用户输入令牌
        this.$dialog.prompt({
          message: `请在此粘贴令牌`,
          inputMaxlength: 1024,
          inputPlaceholder: 'JWT here',
          canCancel: false,
          onConfirm: (value) => {
            jwt = localStorage.jwt = value;
            self.$store.dispatch('setJwt', value);

            //得到令牌之后，就验证一下
            self.auth_validate(jwt,
              () => { self.setPath(self.$route.path); },
              () => { setTimeout(self.auth, 2000); });
          }
        })
      }

      //有令牌，就验证一下
      else {
        self.auth_validate(jwt,
          () => { self.setPath(self.$route.path); },
          () => { setTimeout(self.auth, 2000); });
      }
    },


    setPath: function(current_path) {
      let path = `/api/v1/exmem${current_path}`;

      let jwt = this.$store.state.common.me.jwt || "";
      var self = this

      return axios.get(path, { headers: { 'Authorization': 'bearer ' + jwt } })
        .then(function(res) {
          //console.log(res);

          if (res.data.code && NOT_FOUND == res.data.code) {
            self.content = "# 新文稿\n---\n## 修改完成 点击上面保存"
            self.path = current_path;
          } else if (res.data.code && NOT_PERMIT == res.data.code) {
            self.content = "#该文档你看不到啊，😁，只能找文档主人授权啦"
            self.path = current_path;
          } else {
            self.content = res.data;
            self.path = current_path;
            self.content_changed = false;
          }

        })
        //基本就是权限问题
        .catch(function(error) {
          console.dir(error);

          //更新两个地方
          localStorage.jwt = "";
          self.$store.dispatch('setJwt', "");

          setTimeout(self.auth, 2000);
        })
    },

    saveToPath: function(to_path) {

      let path = `/api/v1/exmem${to_path}`;
      let jwt = this.$store.state.common.me.jwt || "";
      var self = this

      var obj = matter(this.content);

      //console.dir(obj);

      return axios.post(path, { md: obj.content, yaml: obj.data }, { headers: { 'Authorization': 'bearer ' + jwt } })
        .then(function(res) {
          self.content_changed = false;
          console.log("save done");
        })
        //基本就是权限问题
        .catch(function(error) {
          console.dir(error);

          //更新两个地方
          localStorage.jwt = "";
          self.$store.dispatch('setJwt', "");

          setTimeout(self.auth, 2000);
        })
    }

  },
  computed: {

    fileName() {
      let segs = this.path.split('/');
      return segs[segs.length - 1] || "index.md";
    }
  },

  mounted: function() {

    //console.log("DELME:----->mounted");
    this.auth();
    //this.setPath(this.$route.path);
  },

  beforeRouteUpdate: function(to, from, next) {
    console.log("DELME:----->beforeRouteUpdate");

    this.setPath(to.path);
    next();
  }




}

</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import '~mavon-editor/dist/css/index.css'

</style>
