import * as joi from '@hapi/joi';
export function createLeagueValidator(req, res, next) {
  // const fileSchema = joi.object({
  //   game: joi.binary().required(),
  //   mainImage: joi.binary().required(),
  //   images: joi
  //     .array()
  //     .items(joi.binary())
  //     .optional()
  // });
  // console.log(fileSchema.validate(req.files));
  const schema = joi.object({
    name: joi.string().required(),
    description: joi.string().optional(),
    collectionName: joi.string().required(),
    kind: joi.number().required(),
    defaultOpportunity: joi.number().required(),
    maxOpportunity: joi.number().optional(),
    reward: joi.number(),
    leadersNumber: joi.number(),
    loyaltyGiven: joi.number().optional(),
    loyaltyReward: joi.number().optional(),
    startTime: joi.date().required(),
    endTime: joi
      .date()
      .greater(joi.ref('startTime'))
      .required(),
    //  game: joi.binary().required(),
    available: joi.boolean().optional(),
    gameHidden: joi.boolean().optional(),
    html: joi.string().optional(),
    color: joi.string()
    //   mainImage: joi.binary().required(),
    // images: joi
    //   .array()
    //   .items(joi.binary())
    //   .optional()
  });
  const result = schema.validate(req.body);
  if (!result.error && !result.errors) next();
  else return res.status(400).send(result.error.details);
}
export function updateLeagueValidator(req, res, next) {}
export function deleteLeagueValidator(req, res, next) {}
