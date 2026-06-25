import { type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      email,
      phoneNumber,
      password: hashedPassword,
    });

    const token = generateToken((user._id as any).toString());

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Risk Detection: Check if locked out
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const waitTime = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000);
      return res.status(403).json({ message: `Account locked. Try again in ${waitTime} minutes.` });
    }

    if (!user.password) {
      return res.status(401).json({ message: 'This account uses Google Login.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      // Risk Detection: Increment attempts
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
        user.loginAttempts = 0;
        await user.save();
        return res.status(403).json({ message: 'Too many failed attempts. Account locked for 15 minutes.' });
      }
      await user.save();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Success: Reset attempts
    user.loginAttempts = 0;
    user.lockoutUntil = null as any;
    await user.save();

    const token = generateToken((user._id as any).toString());

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const googleAuthCallback = (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).redirect(`${ (process.env.CLIENT_URL || 'https://mini-project-fawn-pi.vercel.app') }/login?error=auth_failed`);
  }

  const user = req.user as any;
  const token = generateToken(user._id);

  // Set token in cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });

  res.redirect(`${ (process.env.CLIENT_URL || 'https://mini-project-fawn-pi.vercel.app') }/dashboard`);
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const setupVault = async (req: Request, res: Response) => {
  try {
    const { password, accountPassword } = req.body;
    const user = await User.findById((req as any).user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Requirement: If updating, must provide account password (for non-google users)
    if (user.vaultPassword && !user.googleId) {
      if (!accountPassword) {
        return res.status(400).json({ message: 'Account password required to change vault key' });
      }
      const isMatch = await bcrypt.compare(accountPassword, user.password || '');
      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect account password' });
      }
    }

    const salt = await bcrypt.genSalt(12);
    user.vaultPassword = await bcrypt.hash(password, salt);
    
    // Create a master hash for verifying the vault key later
    user.masterHash = crypto.createHash('sha256').update(password).digest('hex');
    
    await user.save();
    res.json({ message: 'Vault secured successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const unlockVault = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const user = await User.findById((req as any).user._id);
    if (!user || !user.vaultPassword) {
      return res.status(400).json({ message: 'Vault not setup' });
    }

    const isMatch = await bcrypt.compare(password, user.vaultPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect vault password' });
    }

    // Return a temporary "vault key" derived from the password
    // This key will be used by the frontend to request file decryption
    const vaultKey = crypto.createHash('sha256').update(password).digest('hex');
    
    res.json({ success: true, vaultKey });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out successfully' });
};
export const renameAccount = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const user = await User.findById((req as any).user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if changed in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (user.lastNameChangeAt && user.lastNameChangeAt > sevenDaysAgo) {
      const msLeft = user.lastNameChangeAt.getTime() - sevenDaysAgo.getTime();
      const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
      return res.status(403).json({ 
        message: `Name can only be changed once every 7 days. You can change it again in ${daysLeft} days.` 
      });
    }

    user.name = name;
    user.lastNameChangeAt = new Date();
    await user.save();

    res.json({ message: 'Name updated successfully', user: { name: user.name } });
  } catch (error) {
    res.status(500).json({ message: 'Server error during rename' });
  }
};
