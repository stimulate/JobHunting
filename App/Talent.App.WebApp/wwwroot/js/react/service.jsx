import axios from 'axios'
import qs from 'qs'
import Cookies from 'js-cookie';

let xhr = {
  post: "",
  get: ""
}

var cookies = Cookies.get('talentAuthToken');
axios.defaults.headers.common = { Authorization: `Bearer ${cookies}`, "Access-Control-Allow-Origin": "*" }

xhr.post = function (url, data) {
  let params = qs.stringify(data)
  return new Promise((resolve, reject) => {
    axios.post(url, params).then((res) => {
      resolve(res)
    })
  })
}

xhr.get = function (url, data) {
  let params = qs.stringify(data)  
  return new Promise((resolve, reject) => {
    axios.get(
      url,
      params      
    ).then((res) => {
      resolve(res)
    })
  })
}
export default xhr
