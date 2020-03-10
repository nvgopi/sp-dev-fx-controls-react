import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { PageContext } from "@microsoft/sp-page-context";
import { IFolderExplorerService } from "./IFolderExplorerService";
import { IFolder } from "./IFolderExplorerService";
import { sp, Web, FolderAddResult } from "@pnp/sp";

export class FolderExplorerService implements IFolderExplorerService {

  public static readonly serviceKey: ServiceKey<IFolderExplorerService> = ServiceKey.create<IFolderExplorerService>('SPFx:SPService', FolderExplorerService);

  constructor(serviceScope: ServiceScope) {

    serviceScope.whenFinished(() => {

      const pageContext = serviceScope.consume(PageContext.serviceKey);
      sp.setup({
        sp: {
          baseUrl: pageContext.web.absoluteUrl
        }
      });
    });
  }

  /**
   * Get root folder from library
   * @param listId - the ID of the library to query
   */
  public GetRootFolder = async (listId: string): Promise<IFolder> => {
    return this._getRootFolder(listId);
  }

  /**
   * Get root folder from library
   * @param listId - the ID of the library to query
   */
  private _getRootFolder = async (listId: string): Promise<IFolder> => {
    let rootFolder: IFolder = null;
    try {
      rootFolder = await sp.web.lists.getById(listId).rootFolder.select('Name', 'ServerRelativeUrl').usingCaching().get();
    } catch (error) {
      console.error('Error loading folders', error);
    }
    return rootFolder;
  }

  /**
 * Get folders within a given library or sub folder
 * @param webAbsoluteUrl - the url of the target site
 * @param folderRelativeUrl - the relative url of the folder
 */
  public GetFolders = async (webAbsoluteUrl: string, folderRelativeUrl: string): Promise<IFolder[]> => {
    return this._getFolders(webAbsoluteUrl, folderRelativeUrl);
  }

  /**
   * Get folders within a given library or sub folder
   * @param webAbsoluteUrl - the url of the target site
   * @param folderRelativeUrl - the relative url of the folder
   */
  private _getFolders = async (webAbsoluteUrl: string, folderRelativeUrl: string): Promise<IFolder[]> => {
    let results: IFolder[] = [];
    try {
      const web = new Web(webAbsoluteUrl);
      let foldersResult: IFolder[] = await web.getFolderByServerRelativeUrl(folderRelativeUrl).folders.select('Name', 'ServerRelativeUrl').orderBy('Name').get();
      results = foldersResult.filter(f => f.Name != "Forms");
    } catch (error) {
      console.error('Error loading folders', error);
    }
    return results;
  }

  /**
   * Create a new folder
   * @param webAbsoluteUrl - the url of the target site
   * @param folderRelativeUrl - the relative url of the base folder
   * @param name - the name of the folder to be created
   */
  public AddFolder = async (webAbsoluteUrl: string, folderRelativeUrl: string, name: string): Promise<IFolder> => {
    return this._addFolder(webAbsoluteUrl, folderRelativeUrl, name);
  }

  /**
 * Create a new folder
 * @param webAbsoluteUrl - the url of the target site
 * @param folderRelativeUrl - the relative url of the base folder
 * @param name - the name of the folder to be created
 */
  private _addFolder = async (webAbsoluteUrl: string, folderRelativeUrl: string, name: string): Promise<IFolder> => {
    let folder: IFolder = null;
    try {
      const web = new Web(webAbsoluteUrl);
      let folderAddResult: FolderAddResult = await web.getFolderByServerRelativeUrl(folderRelativeUrl).folders.add(name);
      if (folderAddResult && folderAddResult.data) {
        folder = {
          Name: folderAddResult.data.Name,
          ServerRelativeUrl: folderAddResult.data.ServerRelativeUrl
        };
      }
    } catch (error) {
      console.error('Error adding folder', error);
    }
    return folder;
  }

}
