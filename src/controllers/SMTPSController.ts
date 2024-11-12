import nodemailer from 'nodemailer';

export default class SMTPSController {
    private transporter: nodemailer.Transporter;
    private senderName: string;
    private email:string;

    constructor({user, pass, host, senderName}:{senderName:string, user:string, pass:string, host:string}) {
        this.transporter = nodemailer.createTransport({
            host,
            port: 465,
            secure: true, // 465 is used for SMTPS, while 587 can be upgraded to TLS
            auth: {
                user,
                pass
            }
        });
        this.senderName = senderName;
        this.email = user;
    }
    async closeTransporter() {
        this.transporter.close();
    }

    async sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
        const mailOptions = {
            from: `"${this.senderName}" <${this.email}>`,
            to,
            subject,
            text,
            html,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully');
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }
}