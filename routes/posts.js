const express = require('express');
const router = express.Router();
const { Posts } = require('../models/post.js');
const { Op } = require('sequelize');
// const authMiddleware = require('../middlewares/auth-middleware.js');
//import * as tweetController from '../controller/tweet.js';

// 속성
// title: DataTypes.STRING,
// content: DataTypes.STRING,
// userId: DataTypes.INTEGER,
// likes: DataTypes.INTEGER,

// 게시글 전체 조회
router.get('/', async (req, res) => {
  try {
    const posts = await Posts.findAll({
      attributes: ['id', 'title', 'content', 'createdAt', 'userId', 'likes'],
    });

    return res.status(200).json({ data: posts });
  } catch (error) {
    return res
      .status(400)
      .json({ errorMEssage: '게시글 조회에 실패하였습니다.' });
  }
});

// 게시글 상세 조회
router.get('/:postId', async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Posts.findOne({
      attributes: ['id', 'title', 'content', 'createdAt', 'userId', 'likes'],
      where: { postId },
    });

    return res.status(200).json({ data: post });
  } catch (error) {
    return res
      .status(400)
      .json({ errorMEssage: '게시글 조회에 실패하였습니다.' });
  }
});

// 게시글 작성
router.post('/', async (req, res) => {
  // const { userId, password } = res.locals.user; authMiddleware 적용 이후
  // const { title, content } = req.body; authMiddleware 적용 이후
  const { title, content, password } = req.body;
  const post = await Posts.create({ title, content, password });
  //

  res.status(201).json({ data: post });

  // # 412 body 데이터가 정상적으로 전달되지 않는 경우
  // {"errorMessage": "데이터 형식이 올바르지 않습니다."}

  // # 412 Title의 형식이 비정상적인 경우
  // {"errorMessage": "게시글 제목의 형식이 일치하지 않습니다."}
  if (!title) {
    res
      .status(412)
      .json({ errorMessage: '게시글 제목의 형식이 일치하지 않습니다.' });
    return;
  }

  // # 412 Content의 형식이 비정상적인 경우
  // {"errorMessage": "게시글 내용의 형식이 일치하지 않습니다."}
  if (!content) {
    res
      .status(412)
      .json({ errorMessage: '게시글 내용의 형식이 일치하지 않습니다.' });
    return;
  }

  // # 403 Cookie가 존재하지 않을 경우
  // {"errorMessage": "로그인이 필요한 기능입니다."}
  // if (!userId || !password) {
  //   res.status(403).json({ errorMessage: '로그인 후 사용 가능합니다.' });
  //   return;
  // } // authMiddleware 적용 이후

  // # 403 Cookie가 비정상적이거나 만료된 경우
  // {"errorMessage": "전달된 쿠키에서 오류가 발생하였습니다."}

  // # 400 예외 케이스에서 처리하지 못한 에러
  // {"errorMessage": "게시글 작성에 실패하였습니다."}
});

// 게시글 수정
router.put('/:postId', async (req, res) => {
  // const { userId, password } = res.locals.user; authMiddleware 적용 이후
  // const { title, content } = req.body; // authMiddleware 적용 이후
  const { postId } = req.params;
  const { title, content, password } = req.body;

  const post = await Posts.findOne({
    where: { postId: postId },
  });

  if (!post) {
    return res.status(404).json({
      errorMessage: '게시글이 존재하지 않습니다.',
    });
  } else if (post.password !== password) {
    return res.status(401).json({
      message: '게시글의 비밀번호와, 전달받은 비밀번호가 일치하지 않습니다.',
    });
  }

  // # 412 body 데이터가 정상적으로 전달되지 않는 경우
  // {"errorMessage": "데이터 형식이 올바르지 않습니다."}

  // # 412 Title의 형식이 비정상적인 경우
  // {"errorMessage": "게시글 제목의 형식이 일치하지 않습니다."}
  if (!title) {
    res
      .status(412)
      .json({ errorMessage: '게시글 제목의 형식이 일치하지 않습니다.' });
    return;
  }

  // # 412 Content의 형식이 비정상적인 경우
  // {"errorMessage": "게시글 내용의 형식이 일치하지 않습니다."}
  if (!content) {
    res
      .status(412)
      .json({ errorMessage: '게시글 내용의 형식이 일치하지 않습니다.' });
    return;
  }

  // # 403 게시글을 수정할 권한이 존재하지 않는 경우
  // {"errorMessage": "게시글 수정의 권한이 존재하지 않습니다."}

  // # 403 Cookie가 존재하지 않을 경우
  // {"errorMessage": "로그인이 필요한 기능입니다."}
  // if (!userId || !password) {
  //   res.status(403).json({ errorMessage: '로그인 후 사용 가능합니다.' });
  //   return;
  // } // authMiddleware 적용 이후

  // # 403 Cookie가 비정상적이거나 만료된 경우
  // {"errorMessage": "전달된 쿠키에서 오류가 발생하였습니다."}

  // # 401 게시글 수정이 실패한 경우
  // {"errorMessage": "게시글이 정상적으로 수정되지 않았습니다.”}

  await Posts.update(
    { title, content }, // 수정할 컬럼 및 데이터
    {
      where: {
        [Op.and]: [{ postId }, { password }], // Op.and 모든 조건에 일치해야 한다. 여기서의 역할은 게시글의 postId와 password가 일치할때 수정한다.
      },
    } // 어떤 데이터를 수정할지 작성
  );

  return res.status(200).json({ message: '게시글이 수정되었습니다.' });

  // # 400 예외 케이스에서 처리하지 못한 에러
  // {"errorMessage": "게시글 수정에 실패하였습니다."}
});

// 게시글 삭제
router.delete('/:postId', async (req, res) => {
  // const { userId, password } = res.locals.user; authMiddleware 적용 이후
  const { postId } = req.params;
  const { password } = req.body;

  const post = await Posts.findOne({
    where: { postId: postId },
  });

  if (!post) {
    return res.status(404).json({
      errorMessage: '게시글이 존재하지 않습니다.',
    });
  } else if (post.password !== password) {
    return res.status(401).json({
      message: '게시글의 비밀번호와, 전달받은 비밀번호가 일치하지 않습니다.',
    });
  }

  // # 404 게시글이 존재하지 않는경우
  // {"errorMessage": "게시글이 존재하지 않습니다."}
  // if (!post) {
  //   return res.status(404).json({
  //     errorMessage: '게시글이 존재하지 않습니다.',
  //   });
  // }

  // # 403 게시글을 삭제할 권한이 존재하지 않는 경우
  // {"errorMessage": "게시글의 삭제 권한이 존재하지 않습니다."}

  // # 403 Cookie가 존재하지 않을 경우
  // {"errorMessage": "로그인이 필요한 기능입니다."}
  // if (!userId || !password) {
  //   res.status(403).json({ errorMessage: '로그인 후 사용 가능합니다.' });
  //   return;
  // } // authMiddleware 적용 이후

  // # 403 Cookie가 비정상적이거나 만료된 경우
  // {"errorMessage": "전달된 쿠키에서 오류가 발생하였습니다."}

  // # 401 게시글 삭제에 실패한 경우
  // {"errorMessage": "게시글이 정상적으로 삭제되지 않았습니다.”}

  await Posts.destroy(
    {
      where: {
        [Op.and]: [{ postId }, { password }], // Op.and 모든 조건에 일치해야 한다. 여기서의 역할은 게시글의 postId와 password가 일치할때 삭제한다.
      },
    } // 어떤 데이터를 삭제할지 작성
  );

  return res.status(200).json({ message: '게시글이 삭제되었습니다.' });

  // # 400 예외 케이스에서 처리하지 못한 에러
  // {"errorMessage": "게시글 작성에 실패하였습니다."}
});

module.exports = router;
