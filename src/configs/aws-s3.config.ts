import { v4 as uuidv4 } from 'uuid';
import { S3Client } from '@aws-sdk/client-s3';
import * as multerS3 from 'multer-s3';
import * as dotenv from 'dotenv';
dotenv.config();
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
// const region = process.env.AWS_REGION;
const s3 = new S3Client({
  region: 'eu-north-1',
  credentials: { accessKeyId, secretAccessKey },
});

export const awsOption = {
  storage: multerS3({
    s3,
    bucket: 'intertex-storage',
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const ext = file.originalname.split('.').pop();
      cb(null, `testing-folder/${uuidv4()}.${ext}`);
    },
  }),
};
