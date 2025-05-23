import crypto from 'crypto';

export const encrypt = (data: string) => {
    const key = '6f0823d088824a02a2633ca83d5930b9';
    const cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.alloc(16, 0));
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  };
  
  export const decrypt = (data: string) => {
    const key = '6f0823d088824a02a2633ca83d5930b9';
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.alloc(16, 0));
    let decrypted = decipher.update(data, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  };

  export const generatePassword = (length = 12) => {
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map((byte) => String.fromCharCode(33 + (byte % 94))) // Generate characters from ASCII 33-126
      .join('');
  };
  export const formItemLayout = {
    labelCol: {
      sm: { span: 24 },
      md: { span: 8 },
    },
    wrapperCol: {
      sm: { span: 24 },
      md: { span: 16 },
    },
  };
  
  export const tailFormItemLayout = {
    wrapperCol: {
      sm: {
        span: 24,
        offset: 0,
      },
      md: {
        span: 16,
        offset: 8,
      },
    },
  };
