const plugin = (editor) => {
  const loadingImage = '<img id="loadingImg" src="http://cos.qdqcwy.cn/group1/M00/00/00/rBHIsFtz4TSAJ1P0AAAUUF6elKk222.gif" alt="" />';
  editor.on("Paste", (function (e) {
    let image, pasteEvent;
    pasteEvent = e;
    if (pasteEvent.clipboardData && pasteEvent.clipboardData.items) {
      image = isImage(pasteEvent);
      if (image) {
        e.preventDefault();
        editor.execCommand('mceInsertContent', false, loadingImage);
        return uploadFile(image.getAsFile(), getFilename(pasteEvent));
      }
    }
  }));

  function isImage(data) {
    let i, item;
    i = 0;
    while (i < data.clipboardData.items.length) {
      item = data.clipboardData.items[i];
      if (item.type.indexOf("image") !== -1) {
        return item;
      }
      i++;
    }
    return false;
  }

  function uploadFile(file, filename) {
    let xhr, formData;
    xhr = new XMLHttpRequest();
    xhr.withCredentials = false;
    const pasteUploadConfig = editor.settings.pasteUploadConfig;
    xhr.open('POST', pasteUploadConfig.url);
    if (pasteUploadConfig.headers && pasteUploadConfig.headers.length > 0) {
      for (let header of pasteUploadConfig.headers) {
        xhr.setRequestHeader(header.name, header.value);
      }
    }

    xhr.onload = function () {
      let json;
      json = JSON.parse(xhr.responseText);
      if (xhr.status !== 200) {
        alert('上传失败');
        replaceLoading(filename);
        return;
      } else {
        if (pasteUploadConfig.diyExtractUrl) {
          const imgUrl = pasteUploadConfig.extractUrlFun(json);
          insertIntoTinymce(imgUrl);
        } else {
          insertIntoTinymce(json.data.fullUrl);
        }
      }
    };
    formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
  }

  function insertIntoTinymce(url) {
    let content = editor.getContent();
    content = content.replace(loadingImage, '<img src="' + url + '">');
    editor.setContent(content);
    editor.selection.select(editor.getBody(), true);
    editor.selection.collapse(false);
  }

  function replaceLoading(filename) {
    let content = editor.getContent();
    content = content.replace(loadingImage, filename);
    editor.setContent(content);
    editor.selection.select(editor.getBody(), true);
    editor.selection.collapse(false);
  }

  function getFilename(e) {
    let value;
    if (window.clipboardData && window.clipboardData.getData) {
      value = window.clipboardData.getData("Text");
    } else if (e.clipboardData && e.clipboardData.getData) {
      value = e.clipboardData.getData("text/plain");
    }
    value = value.split("\r");
    return value[0];
  }
};

export default plugin;
