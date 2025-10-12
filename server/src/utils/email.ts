import nodemailer from 'nodemailer';
import { config } from '../config/config';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// 创建邮件传输器
const createTransporter = () => {
  if (config.NODE_ENV === 'development') {
    // 开发环境使用测试账户
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }

  // 生产环境使用真实SMTP
  return nodemailer.createTransporter({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: config.EMAIL_PORT === 465,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS
    }
  });
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"投机计算器" <${config.EMAIL_USER || 'noreply@calculator.com'}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);

    if (config.NODE_ENV === 'development') {
      console.log('邮件发送成功:', nodemailer.getTestMessageUrl(info));
    } else {
      console.log('邮件发送成功:', info.messageId);
    }
  } catch (error) {
    console.error('邮件发送失败:', error);
    throw new Error('邮件发送失败');
  }
};