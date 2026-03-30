import * as AWS from 'aws-sdk';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';

const region = process.env.AWS_REGION || 'eu-north-1';
const bucket = process.env.AWS_BUCKET_NAME || 'intertex-storage';

const canUseS3 =
  !!process.env.AWS_ACCESS_KEY_ID &&
  !!process.env.AWS_SECRET_ACCESS_KEY &&
  !!bucket;

const s3 = canUseS3
  ? new AWS.S3({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export const awsOption = canUseS3 && s3
  ? {
      storage: multerS3({
        s3: s3 as any,
        bucket,
        acl: 'public-read',
        metadata: (req, file, cb) => {
          cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
          cb(null, `products/${Date.now()}-${file.originalname}`);
        },
      }),
    }
  : {
      storage: multer.memoryStorage(),
    };
