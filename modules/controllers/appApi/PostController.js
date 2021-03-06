const Controller = require('./Controller')
const Post = require(`${config.path.model}/post`);
const User = require(`${config.path.model}/user`);

module.exports = new class SampleController extends Controller {
    index(req , res) {
      User.findById(req.user._id, (err, user) => {
        Post.find( { $or: [ { user_id: user.following }, { user_id: req.user._id } ] } )
        .populate('User')
        .exec()
        .then((err, posts) => {
          if(err){
            res.json({
              data : err,
              success : false
            });
          }
          res.json({
              data : posts,
              success : true
          });
        });
      });
    }

    add(req, res) {
      req.checkBody('body' , 'وارد کردن فیلد متن الزامیست').notEmpty();
      this.escapeAndTrim(req , 'body');
      if(this.showValidationErrors(req, res))
          return;

      let postId;

      let newPost = new Post();
      newPost.body = req.body.body;
      newPost.user_id = req.user._id;
      newPost.user_username = req.user.username;
      newPost.user_profile_img = req.user.profile_img;
      newPost.save(err => {
        if(err) {
          res.json({
            data : err,
            success : false
          })};
        res.redirect('/api/appapi/savePost?postid=' + newPost._id);
      });
    }

    savePost(req, res) {
      User.findById(req.user._id, (err, user) => {
        if(err) {
          res.json({
            data : err,
            success : false
          })};
        user.posts.push(req.query.postid);
        user.save(err => {
          if (err) {
            res.json({
              data : err,
              success : false
            });
          }
          res.json({
            data : 'پست با موفقیت ثبت شد',
            success : true
          });
        });
      });
    }

    come(req, res) {
      Post.findById(req.params.post_id, (err, post) => {
        if(err){
          res.send(err);
        }
        if(!post.incomer.includes(req.user._id)){
          post.incomer.push(req.user._id);
          post.save(err => {
            if (err) {
              res.json({
                data : err,
                success : false
              });
            }
            res.json({
                success : true
            });
          });
        } else {
          res.json({
              success : true
          });
        }
      });
    }
}
