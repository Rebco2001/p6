const Thing = require('../models/Thing');
const fs = require('fs');

exports.createThing = (req, res, next) => {
    console.log(req.body.sauce);
    const thingObject = JSON.parse(req.body.sauce);
    delete thingObject._id;
    delete thingObject._userId;
    const sauce = new Thing({
      ...thingObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    console.log(sauce);
    sauce.save()
      .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
      .catch(error => res.status(400).json({ error }));
  };

exports.getOneThing = (req, res, next) => {
  Thing.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifyThing = (req, res, next) => {
  const thingObject = req.file ? {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete thingObject._userId;
  Thing.findOne({_id: req.params.id})
      .then((sauce) => {
          if (sauce.userId != req.auth.userId) {
              console.log("non autorisée")
              res.status(401).json({ message : 'Not authorized'});
          } else {
              Thing.updateOne({ _id: req.params.id}, { ...thingObject, _id: req.params.id})
              .then(() => {console.log("objet modifié") 
              res.status(200).json({message : 'Objet modifié!'})})
              .catch(error =>{console.log("erreur" +error) 
              res.status(401).json({ error })});
          }
      })
      .catch((error) => {console.log("erreur" +error)
          res.status(400).json({ error });
      });
};

exports.deleteThing = (req, res, next) => {
  Thing.findOne({ _id: req.params.id})
      .then(sauce => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              const filename = sauce.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  Thing.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};

exports.getAllSauces = (req, res, next) => {
  Thing.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

/*exports.likeDislike = (req, res, next) => {
  let like = req.body.like;
  let userId= req.auth.userId;
  let sauceId= req.params.id;

  Thing.findOne({ _id: req.params.id})
      .then(sauce => {
          if (like==1) {
              sauce.likes=1;
              sauce.usersLiked.push(userId)
              sauce.save()
              .then(() => res.status(201).json({ message: 'produit liké'}))
              .catch(error => res.status(400).json({ error }));
          } else if(like==-1){
              sauce.dislikes=1;
              sauce.usersDisliked.push(userId)
              sauce.save()
              .then(() => res.status(201).json({ message: 'produit disliké'}))
              .catch(error => res.status(400).json({ error }));
          } else{
            Thing.findOne({ _id: sauceId })
            .then((sauce) => {
              if (sauce.usersLiked.includes(userId)) {
                Thing.findOne({ _id: sauceId })
                .updateOne(
                  { _id: sauceId }, {$pull: { usersLiked: userId }, $inc: { likes: -1 } }
                )
                  .then((sauce) => {
                    res.status(200).json({ message: "Sauce dépréciée" });
                  })
                  .catch((error) => res.status(500).json({ error }));
              } else if (sauce.usersDisliked.includes(userId)) {
                Thing.updateOne(
                  { _id: sauceId }, { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 },}
                )
                  .then((sauce) => {
                    res.status(200).json({ message: "Sauce appréciée" });
                  })
                  .catch((error) => res.status(500).json({ error }));
              }
            })
            .catch((error) => res.status(401).json({ error }));
          }          
      })
      .catch( error => {
          res.status(505).json({ error });
      });
  console.log(sauceId);
};*/

exports.likeDislike = (req, res, next) => {
  const sauceId = req.params.id;
  const userId = req.body.userId;
  const like = req.body.like;

  if (like === 1) {
    Thing.updateOne(
      { _id: sauceId },
      {
        $inc: { likes: like },
        $push: { usersLiked: userId },
      }
    )
      .then((sauce) => res.status(200).json({ message: "Sauce appréciée" }))
      .catch((error) => res.status(500).json({ error }));
  }


  else if (like === -1) {
    Thing.updateOne(
      { _id: sauceId },
      {
        $inc: { dislikes: -1 * like },
        $push: { usersDisliked: userId },
      }
    )
      .then((sauce) => res.status(200).json({ message: "Sauce dépréciée" }))
      .catch((error) => res.status(500).json({ error }));
  }
  
  
  else {
    Thing.findOne({ _id: sauceId })
      .then((sauce) => {
        if (sauce.usersLiked.includes(userId)) {
          Thing.updateOne(
            { _id: sauceId },
            { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
          )
            .then((sauce) => {
              res.status(200).json({ message: "Sauce dépréciée" });
            })
            .catch((error) => res.status(500).json({ error }));
          
        } else if (sauce.usersDisliked.includes(userId)) {
          Thing.updateOne(
            { _id: sauceId },
            {
              $pull: { usersDisliked: userId },
              $inc: { dislikes: -1 },
            }
          )
            .then((sauce) => {
              res.status(200).json({ message: "Sauce appréciée" });
            })
            .catch((error) => res.status(500).json({ error }));
        }
      })
      .catch((error) => res.status(401).json({ error }));
  }
};