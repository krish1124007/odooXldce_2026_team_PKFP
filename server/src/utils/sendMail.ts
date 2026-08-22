import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

interface MailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    from?: string;
}

let transporter: Transporter | null = null;

// Initialize transporter (only once)
function getTransporter(): Transporter {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    return transporter;
}

export async function sendMail(options: MailOptions): Promise<void> {
    const mailOptions = {
        from: options.from || process.env.SMTP_FROM || "no-reply@example.com",
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    try {
        const transporter = getTransporter();
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
}
