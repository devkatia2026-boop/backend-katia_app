import { DataTypes, Model, Sequelize } from 'sequelize';

export class Playlist extends Model {
  declare id: number;
  declare status: boolean | null;
  declare photo: string | null;
  declare playlist_link: string | null;
  declare tittle: string | null;
  declare description: string | null;
  declare readonly created_at: Date;
}

export function initPlaylist(sequelize: Sequelize): typeof Playlist {
  Playlist.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      status: DataTypes.BOOLEAN,
      photo: DataTypes.TEXT,
      playlist_link: DataTypes.TEXT,
      tittle: DataTypes.STRING,
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      tableName: 'playlists',
      modelName: 'Playlist',
    }
  );

  return Playlist;
}
