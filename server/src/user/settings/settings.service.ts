import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Settings } from './schemas/settings.schema';
import { SettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name)
    private readonly SettingsModel: Model<Settings>
  ) {}

  private defaultOptions: SettingsDto = {
    alwaysLoopVideo: false,
    audioModeDefault: false,
    autoAdjustAudioQuality: true,
    autoAdjustVideoQuality: true,
    autoplay: false,
    autoplayNextVideo: false,
    chapters: true,
    dashPlaybackEnabled: true,
    defaultAudioQuality: '192kb',
    defaultVideoQuality: '720p',
    defaultVideoSpeed: 1,
    miniplayer: true,
    saveVideoHistory: true,
    showHomeSubscriptions: true,
    sponsorblockEnabled: true,
    sponsorblockSegmentInteraction: 'ask',
    sponsorblockSegmentIntro: 'ask',
    sponsorblockSegmentMusicOfftopic: 'ask',
    sponsorblockSegmentOutro: 'ask',
    sponsorblockSegmentPreview: 'ask',
    sponsorblockSegmentSelfpromo: 'ask',
    sponsorblockSegmentSponsor: 'ask',
    theme: 'default'
  };

  async setSettings(settings: Partial<SettingsDto>, username: string): Promise<void> {
    if (username) {
      try {
        await this.SettingsModel.findOneAndUpdate({ username }, settings, { upsert: true }).exec();
      } catch (err) {
        throw new InternalServerErrorException('Error updating settings');
      }
    } else {
      throw new InternalServerErrorException('Error finding user');
    }
  }

  async getSettings(username: string): Promise<SettingsDto> {
    if (username) {
      try {
        const settings = (await this.SettingsModel.findOne({ username }).exec()) || {};
        return this.getCompleteSettingsObject(settings);
      } catch (err) {
        throw new InternalServerErrorException('Error retrieving settings');
      }
    }
  }

  async deleteSettings(username: string): Promise<{ success: boolean }> {
    let success = true;
    await this.SettingsModel.deleteOne({ username })
      .exec()
      .catch(_ => {
        success = false;
      });
    return { success };
  }

  private getCompleteSettingsObject(settings: Partial<SettingsDto>): SettingsDto {
    const completeSettings: SettingsDto = {} as SettingsDto;
    Object.keys(this.defaultOptions).forEach(settingsKey => {
      if (settings[settingsKey] !== undefined) {
        completeSettings[settingsKey] = settings[settingsKey];
      } else {
        completeSettings[settingsKey] = this.defaultOptions[settingsKey];
      }
    });
    return completeSettings;
  }
}
