<template>
  <div class="">
    <h1>{{fileName}}<span v-if="content_changed">*</span></h1>
    <h3>{{path}}</h3>
    <markdown-editor v-model="content" ref="markdownEditor" :configs="configs" :highlight="true"></markdown-editor>
  </div>
</template>
<script>
import markdownEditor from 'vue-simplemde/src/markdown-editor';
import axios from 'axios';
import matter from 'gray-matter';
import hljs from 'highlight.js';
window.hljs = hljs;


export default {
  name: 'editor',

  components: {
    markdownEditor
  },

  data() {
    return {
      content_changed: false,
      path: this.$route.path,
      content: "",
      configs: {
        spellChecker: false, // 禁用拼写检查
        toolbar: ["bold", "italic", "heading", "|",
          "quote", "unordered-list", "ordered-list", "|", //"link", 
          "image", "|",
          "preview", "side-by-side", "fullscreen", // "guide",
          {
            name: "relation",
            action: this.createRelation,
            className: "fa fa-external-link",
            title: "Relation",
          },
          {
            name: "save",
            action: this.saveContent,
            className: "fa fa-save",
            title: "Save (Ctrl+S)",
          }
        ]
      },
    }
  },

  methods: {
    saveContent: function(editor) {
      this.saveToPath(this.path);
    },

    createRelation: function(editor) {
      var cm = editor.codemirror;
      var startPoint = cm.getCursor('start');
      var endPoint = cm.getCursor('end');
      var text = cm.getSelection() || "";
      cm.replaceSelection('[' + text + '](/words/' + text + ')');
      //startPoint.ch += 1;
      //endPoint.ch += 1;
      //cm.setSelection(startPoint, endPoint);
      cm.focus();
    },

    setPath: function(current_path) {

      let path = `http://127.0.0.1:3030/api/v1/exmem${current_path}`;
      var self = this

      return axios.get(path)
        .then(function(res) {
          //console.log(res);
          self.content = res.data;
          self.path = current_path;
          self.content_changed = false;

        })
        .catch(function(error) {
          //console.dir(error);
          self.content = "# 新文稿\n---\n## 修改完成 点击上面保存"
          self.path = current_path + "(新文稿)";
        })
    },

    saveToPath: function(to_path) {

      let path = `http://127.0.0.1:3030/api/v1/exmem${to_path}`;
      var self = this

      var obj = matter(this.content);

      console.dir(obj);

      return axios.post(path, { md: obj.content, yaml: obj.data })
        .then(function(res) {
          self.content_changed = false;
          console.log("save done");
        })
        .catch(function(error) {
          console.dir(error);
        })
    }

  },
  computed: {
    simplemde() {
      return this.$refs.markdownEditor.simplemde;
    },

    fileName() {
      let segs = this.path.split('/');
      return segs[segs.length - 1];
    }
  },

  mounted: function() {
    this.setPath(this.$route.path);
    this.simplemde.codemirror.on("inputRead", () => {
      this.content_changed = true;
    });
  },

  beforeRouteUpdate: function(to, from, next) {
    //console.log(`from: ${from.path} to:${to.path}`);
    this.setPath(to.path);
    next();
  }




}

</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import '~simplemde/dist/simplemde.min.css';
@import '~highlight.js/styles/atelier-forest-dark.css';

</style>
